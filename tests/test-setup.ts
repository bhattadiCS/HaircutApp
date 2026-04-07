import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

export const TEST_FIREBASE_PROJECT_ID = 'styleshift-app-test';

export const TEST_FIREBASE_PORTS = Object.freeze({
  auth: 9099,
  firestore: 8080,
  functions: 5001,
  storage: 9199,
  hub: 4400,
});

export const TEST_ENV = Object.freeze({
  GCLOUD_PROJECT: TEST_FIREBASE_PROJECT_ID,
  FIREBASE_AUTH_EMULATOR_HOST: `127.0.0.1:${TEST_FIREBASE_PORTS.auth}`,
  FIRESTORE_EMULATOR_HOST: `127.0.0.1:${TEST_FIREBASE_PORTS.firestore}`,
  FIREBASE_STORAGE_EMULATOR_HOST: `127.0.0.1:${TEST_FIREBASE_PORTS.storage}`,
  VITE_USE_FIREBASE_EMULATORS: 'true',
  VITE_FIREBASE_API_KEY: 'testing-key',
  VITE_FIREBASE_AUTH_DOMAIN: `${TEST_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  VITE_FIREBASE_PROJECT_ID: TEST_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: `${TEST_FIREBASE_PROJECT_ID}.appspot.com`,
  VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
  VITE_FIREBASE_APP_ID: '1:123456789:web:styleshift-test',
  VITE_FIREBASE_AUTH_PORT: String(TEST_FIREBASE_PORTS.auth),
  VITE_FIREBASE_FIRESTORE_PORT: String(TEST_FIREBASE_PORTS.firestore),
  VITE_FIREBASE_FUNCTIONS_PORT: String(TEST_FIREBASE_PORTS.functions),
  VITE_FIREBASE_STORAGE_PORT: String(TEST_FIREBASE_PORTS.storage),
});

const runtimeDir = path.resolve(process.cwd(), '.test-runtime');
const emulatorStatePath = path.join(runtimeDir, 'firebase-emulators.json');
const bundledJdkPath = path.join(runtimeDir, 'openjdk21');
const bundledJdkZipPath = path.join(runtimeDir, 'openjdk21.zip');

function canExecuteJava(javaBinary = 'java') {
  const result =
    process.platform === 'win32'
      ? spawnSync('cmd.exe', ['/c', `${javaBinary} -version`], {
          stdio: 'pipe',
        })
      : spawnSync(javaBinary, ['-version'], {
          stdio: 'pipe',
        });

  if (result.status !== 0) {
    return false;
  }

  const output = (
    result.stderr?.toString() ||
    result.stdout?.toString() ||
    ''
  ).toLowerCase();

  const versionMatch = output.match(/version\s*"(?:1\.)?(\d+)/i);
  if (!versionMatch) {
    return false;
  }

  const majorVersion = parseInt(versionMatch[1], 10);
  return majorVersion >= 21;
}

async function isPortReady(port: number) {
  return new Promise<boolean>((resolve) => {
    const socket = net.createConnection({
      host: '127.0.0.1',
      port,
    });

    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.setTimeout(500, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function getBundledJavaHome() {
  if (!existsSync(bundledJdkPath)) {
    return null;
  }

  const entries = await readdir(bundledJdkPath, { withFileTypes: true });
  const javaHome = entries.find((entry) => entry.isDirectory());

  if (!javaHome) {
    return null;
  }

  return path.join(bundledJdkPath, javaHome.name);
}

async function ensureJavaRuntime() {
  if (canExecuteJava()) {
    return null;
  }

  const existingJavaHome = await getBundledJavaHome();
  if (existingJavaHome) {
    const javaBinary =
      process.platform === 'win32'
        ? path.join(existingJavaHome, 'bin', 'java.exe')
        : path.join(existingJavaHome, 'bin', 'java');

    if (canExecuteJava(javaBinary)) {
      return existingJavaHome;
    }
  }

  if (process.platform !== 'win32') {
    throw new Error('Java is required to run the Firestore emulator.');
  }

  await mkdir(runtimeDir, { recursive: true });

  if (!existsSync(bundledJdkZipPath)) {
    const response = await fetch(
      'https://api.adoptium.net/v3/binary/latest/21/ga/windows/x64/jdk/hotspot/normal/eclipse',
    );

    if (!response.ok) {
      throw new Error('Unable to download the portable JDK for Firestore emulator tests.');
    }

    const archive = Buffer.from(await response.arrayBuffer());
    await writeFile(bundledJdkZipPath, archive);
  }

  await rm(bundledJdkPath, { recursive: true, force: true });
  await mkdir(bundledJdkPath, { recursive: true });

  const extractResult = spawnSync(
    'powershell.exe',
    [
      '-NoProfile',
      '-Command',
      `Expand-Archive -Path '${bundledJdkZipPath.replace(/'/g, "''")}' -DestinationPath '${bundledJdkPath.replace(/'/g, "''")}' -Force`,
    ],
    {
      stdio: 'ignore',
    },
  );

  if (extractResult.status !== 0) {
    throw new Error('Unable to extract the portable JDK for Firestore emulator tests.');
  }

  const javaHome = await getBundledJavaHome();
  if (!javaHome) {
    throw new Error('The portable JDK archive did not extract correctly.');
  }

  return javaHome;
}

async function isEmulatorHubReady() {
  try {
    const response = await fetch(
      `http://127.0.0.1:${TEST_FIREBASE_PORTS.hub}/emulators`,
    );

    return response.ok;
  } catch {
    return false;
  }
}

async function waitForEmulatorHub(timeout = 120_000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (
      (await isEmulatorHubReady()) &&
      (await isPortReady(TEST_FIREBASE_PORTS.auth)) &&
      (await isPortReady(TEST_FIREBASE_PORTS.firestore)) &&
      (await isPortReady(TEST_FIREBASE_PORTS.functions)) &&
      (await isPortReady(TEST_FIREBASE_PORTS.storage))
    ) {
      return;
    }

    await delay(500);
  }

  throw new Error('Firebase emulators did not become ready in time.');
}

export function applyTestEnvironment() {
  Object.assign(process.env, TEST_ENV);
}

async function writeEmulatorState(pid: number) {
  await mkdir(runtimeDir, { recursive: true });
  await writeFile(emulatorStatePath, JSON.stringify({ pid }, null, 2), 'utf8');
}

async function readEmulatorState() {
  if (!existsSync(emulatorStatePath)) {
    return null;
  }

  const state = await readFile(emulatorStatePath, 'utf8');
  return JSON.parse(state) as { pid: number };
}

export async function startFirebaseEmulators() {
  applyTestEnvironment();

  if (await isEmulatorHubReady()) {
    return;
  }

  const javaHome = await ensureJavaRuntime();
  const javaPath = javaHome ? path.join(javaHome, 'bin') : null;
  const resolvedPath = javaPath
    ? `${javaPath}${path.delimiter}${process.env.PATH || ''}`
    : process.env.PATH;

  const sharedOptions = {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ...TEST_ENV,
      ...(javaHome ? { JAVA_HOME: javaHome } : {}),
      PATH: resolvedPath,
    },
    detached: true,
    stdio: 'ignore' as const,
    windowsHide: true,
  };

  const emulatorProcess =
    process.platform === 'win32'
      ? spawn(
          'cmd.exe',
          [
            '/c',
            `set "JAVA_HOME=${javaHome?.replace(/'/g, "''") ?? ''}" && set "PATH=${resolvedPath?.replace(/'/g, "''") ?? ''}" && npx firebase emulators:start --project ${TEST_FIREBASE_PROJECT_ID} --config firebase.json --only auth,firestore,functions,storage`,
          ],
          sharedOptions,
        )
      : spawn(
          'npx',
          [
            'firebase',
            'emulators:start',
            '--project',
            TEST_FIREBASE_PROJECT_ID,
            '--config',
            'firebase.json',
            '--only',
            'auth,firestore,functions,storage',
          ],
          sharedOptions,
        );

  emulatorProcess.unref();
  await writeEmulatorState(emulatorProcess.pid);
  await waitForEmulatorHub();
}

async function deleteResource(url: string) {
  const response = await fetch(url, { method: 'DELETE' });

  if (!response.ok && response.status !== 404) {
    throw new Error(`Failed to clear emulator resource at ${url}.`);
  }
}

export async function clearEmulatorData() {
  applyTestEnvironment();

  if (!(await isEmulatorHubReady())) {
    return;
  }

  await deleteResource(
    `http://127.0.0.1:${TEST_FIREBASE_PORTS.auth}/emulator/v1/projects/${TEST_FIREBASE_PROJECT_ID}/accounts`,
  );
  await deleteResource(
    `http://127.0.0.1:${TEST_FIREBASE_PORTS.firestore}/emulator/v1/projects/${TEST_FIREBASE_PROJECT_ID}/databases/(default)/documents`,
  );
}

export async function stopFirebaseEmulators() {
  const state = await readEmulatorState();

  if (!state?.pid) {
    return;
  }

  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(state.pid), '/T', '/F'], {
      stdio: 'ignore',
    });
  } else {
    try {
      process.kill(-state.pid, 'SIGTERM');
    } catch {
      try {
        process.kill(state.pid, 'SIGTERM');
      } catch {
        // Ignore teardown race conditions.
      }
    }
  }

  await rm(emulatorStatePath, { force: true });
}

export async function setupTestEnvironment() {
  applyTestEnvironment();
  await startFirebaseEmulators();
  await clearEmulatorData();
}