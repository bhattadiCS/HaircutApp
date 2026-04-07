import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  auth,
  collection,
  db,
  deleteDoc,
  deleteObject,
  deleteUser,
  doc,
  getDocs,
  ref,
  requestDeleteAccountCascade,
  shouldUseEmulators,
  signOut,
  storage,
} from '../firebase';
import { useAppStore } from '../store/useAppStore';
import { useLocalLLM } from '../features/ai/hooks/useLocalLLM';
import EditProfileModal from '../features/auth/EditProfileModal';
import VibeCheck from '../features/quiz/VibeCheck';
import ShareStudio from '../features/share/ShareStudio';
import SettingsSheet from '../features/settings/SettingsSheet';
import MagicStudio from '../features/studio/MagicStudio';
import MirrorMode from '../features/studio/MirrorMode';
import RefineStudio from '../features/studio/RefineStudio';
import { useStudioGeneration } from '../features/studio/hooks/useStudioGeneration';
import { useCamera } from '../features/vision/hooks/useCamera';
import { getFaceFocusStyle } from '../features/vision/lib/faceFocus';

const ACCOUNT_DELETE_TIMEOUT_MS = 4000;

function withTimeout(promise, timeoutMs, message) {
  return new Promise((resolve, reject) => {
    const timeoutId = globalThis.setTimeout(() => reject(new Error(message)), timeoutMs);

    promise.then(
      (value) => {
        globalThis.clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        globalThis.clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

function getAccountDeleteEndpoint() {
  const apiKey = auth.app.options.apiKey;

  if (shouldUseEmulators) {
    const emulatorHost = window.location.hostname && window.location.hostname !== 'localhost'
      ? window.location.hostname
      : '127.0.0.1';
    const emulatorPort = Number(import.meta.env.VITE_FIREBASE_AUTH_PORT || 9099);

    return `http://${emulatorHost}:${emulatorPort}/identitytoolkit.googleapis.com/v1/accounts:delete?key=${apiKey}`;
  }

  return `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${apiKey}`;
}

async function deleteAccountWithFallback(activeUser) {
  try {
    await withTimeout(
      deleteUser(activeUser),
      ACCOUNT_DELETE_TIMEOUT_MS,
      'deleteUser timed out.',
    );
    return;
  } catch (sdkError) {
    console.warn('deleteUser timed out, retrying via REST endpoint.', sdkError);
  }

  const idToken = await activeUser.getIdToken(true);
  const response = await fetch(getAccountDeleteEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.error?.message || `Account deletion failed with HTTP ${response.status}.`;

    throw new Error(message);
  }
}

export default function AuthenticatedStudioShell({ persistVibeSelection }) {
  const user = useAppStore((state) => state.user);
  const userProfile = useAppStore((state) => state.userProfile);
  const view = useAppStore((state) => state.view);
  const originalImage = useAppStore((state) => state.originalImage);
  const generatedImage = useAppStore((state) => state.generatedImage);
  const selectedStyle = useAppStore((state) => state.selectedStyle);
  const analysisResult = useAppStore((state) => state.analysisResult);
  const processStep = useAppStore((state) => state.processStep);
  const history = useAppStore((state) => state.history);
  const refinementNote = useAppStore((state) => state.refinementNote);
  const show360 = useAppStore((state) => state.show360);
  const showSettings = useAppStore((state) => state.showSettings);
  const showEditProfile = useAppStore((state) => state.showEditProfile);
  const localOnlyMode = useAppStore((state) => state.localOnlyMode);
  const setUser = useAppStore((state) => state.setUser);
  const setUserProfile = useAppStore((state) => state.setUserProfile);
  const setView = useAppStore((state) => state.setView);
  const setOriginalImage = useAppStore((state) => state.setOriginalImage);
  const clearOriginalImage = useAppStore((state) => state.clearOriginalImage);
  const setToast = useAppStore((state) => state.setToast);
  const openSettings = useAppStore((state) => state.openSettings);
  const closeSettings = useAppStore((state) => state.closeSettings);
  const openEditProfile = useAppStore((state) => state.openEditProfile);
  const closeEditProfile = useAppStore((state) => state.closeEditProfile);
  const toggleLocalOnlyMode = useAppStore((state) => state.toggleLocalOnlyMode);
  const toggle360 = useAppStore((state) => state.toggle360);
  const signOutReset = useAppStore((state) => state.signOutReset);
  const aiRuntime = useLocalLLM();
  const camera = useCamera();
  const { handleGenerate, handleRefine } = useStudioGeneration({
    aiRuntime,
    getVisionSnapshot: camera.getVisionSnapshot,
  });
  const originalImageFocusStyle = getFaceFocusStyle(camera.visionState.focusBox);

  useEffect(() => {
    if (camera.error) {
      setToast({ message: camera.error, type: 'error' });
    }
  }, [camera.error, setToast]);

  useEffect(() => {
    if (
      view === 'mirror' &&
      originalImage &&
      aiRuntime.status === 'idle' &&
      aiRuntime.targetProfile.isConfigured
    ) {
      void aiRuntime.warmup();
    }
  }, [aiRuntime, originalImage, view]);

  async function handleShareLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast({ message: 'Link copied to clipboard.', type: 'success' });
    } catch {
      setToast({ message: 'Sharing is unavailable here.', type: 'error' });
      throw new Error('Link sharing unavailable.');
    }
  }

  async function handleDeleteAccount() {
    camera.stopCamera();

    const activeUser = auth.currentUser;

    if (!activeUser) {
      signOutReset();
      return { ok: true };
    }

    try {
      try {
        const idToken = await activeUser.getIdToken(true);

        await requestDeleteAccountCascade({
          idToken,
          photoURL: activeUser.photoURL || userProfile?.photoURL || '',
        });
      } catch (requestError) {
        console.warn('deleteAccountCascade request failed, falling back to client deletion.', requestError);

        const historySnapshot = await getDocs(collection(db, 'users', activeUser.uid, 'history'));

        await Promise.all(
          historySnapshot.docs.map((entry) =>
            deleteDoc(doc(db, 'users', activeUser.uid, 'history', entry.id)),
          ),
        );
        await deleteDoc(doc(db, 'users', activeUser.uid));

        if (activeUser.photoURL && /^https?:/i.test(activeUser.photoURL)) {
          try {
            await deleteObject(ref(storage, activeUser.photoURL));
          } catch (error) {
            console.warn('Profile photo cleanup failed:', error);
          }
        }

        await deleteAccountWithFallback(activeUser);
      }

      await signOut(auth).catch(() => undefined);
      signOutReset();
      return { ok: true };
    } catch (error) {
      console.error('Account deletion failed:', error);
      setToast({
        message: 'Account deletion failed. Sign back in and try again.',
        type: 'error',
      });
      return { ok: false };
    }

  }

  function handleImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (loadEvent) => {
      if (typeof loadEvent.target?.result !== 'string') {
        return;
      }

      const nextImage = loadEvent.target.result;

      setOriginalImage(nextImage);

      if (camera.isCameraOpen) {
        camera.stopCamera();
      }

      await camera.analyzeImage(nextImage);
    };

    event.target.value = '';
    reader.readAsDataURL(file);
  }

  function handleTakePhoto() {
    const capture = camera.capturePhoto();

    if (!capture?.image) {
      setToast({ message: 'Capture failed. Try again.', type: 'error' });
      return;
    }

    setOriginalImage(capture.image);
    camera.stopCamera({ preserveVisionState: true });
  }

  function handleMirrorBack() {
    if (camera.isCameraOpen) {
      camera.stopCamera();
    }

    camera.resetVisionState();
    setView('quiz');
  }

  function handleClearPortrait() {
    clearOriginalImage();
    camera.resetVisionState();
  }

  async function handleSignOut() {
    camera.stopCamera();

    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (error) {
      console.error('Sign out failed:', error);
    }

    signOutReset();
  }

  let activeScene = null;

  if (view === 'quiz') {
    activeScene = (
      <VibeCheck
        key="quiz"
        user={user}
        onVibeSelect={persistVibeSelection}
        onOpenSettings={openSettings}
      />
    );
  }

  if (view === 'mirror') {
    activeScene = (
      <MirrorMode
        key="mirror"
        user={user}
        originalImage={originalImage}
        isCameraOpen={camera.isCameraOpen}
        videoRef={camera.videoRef}
        canvasRef={camera.canvasRef}
        analysisResult={analysisResult}
        show360={show360}
        visionState={camera.visionState}
        imageFocusStyle={originalImageFocusStyle}
        aiRuntime={aiRuntime}
        onBack={handleMirrorBack}
        onOpenSettings={openSettings}
        onStartCamera={camera.startCamera}
        onStopCamera={camera.stopCamera}
        onTakePhoto={handleTakePhoto}
        onImageUpload={handleImageUpload}
        onClearImage={handleClearPortrait}
        onToggle360={toggle360}
        onGenerate={handleGenerate}
      />
    );
  }

  if (view === 'magic') {
    activeScene = (
      <MagicStudio
        key="magic"
        originalImage={originalImage}
        imageFocusStyle={originalImageFocusStyle}
        processStep={processStep}
      />
    );
  }

  if (view === 'refine') {
    activeScene = (
      <RefineStudio
        key="refine"
        generatedImage={generatedImage}
        originalImage={originalImage}
        originalImageStyle={originalImageFocusStyle}
        analysisResult={analysisResult}
        onBack={() => setView('mirror')}
        onContinueToShare={() => setView('share')}
        onRefine={handleRefine}
        refinementNote={refinementNote}
      />
    );
  }

  if (view === 'share') {
    activeScene = (
      <ShareStudio
        key="share"
        selectedStyle={selectedStyle}
        originalImage={originalImage}
        generatedImage={generatedImage}
        originalFaceFocus={camera.visionState.focusBox}
        originalImageStyle={originalImageFocusStyle}
        analysisResult={analysisResult}
        refinementNote={refinementNote}
        onBack={() => setView('refine')}
        onShareLink={handleShareLink}
      />
    );
  }

  return (
    <>
      <SettingsSheet
        isOpen={showSettings}
        user={user}
        aiRuntime={aiRuntime}
        history={history}
        localOnlyMode={localOnlyMode}
        onClose={closeSettings}
        onToggleLocalOnlyMode={toggleLocalOnlyMode}
        onOpenEditProfile={() => {
          openEditProfile();
          closeSettings();
        }}
        onDeleteAccount={handleDeleteAccount}
        onSignOut={handleSignOut}
      />

      <EditProfileModal
        isOpen={showEditProfile}
        onClose={closeEditProfile}
        user={user}
        userProfile={userProfile}
        onUpdateUser={setUser}
        onUpdateProfile={setUserProfile}
      />

      <AnimatePresence initial={false} mode="wait">
        {activeScene}
      </AnimatePresence>
    </>
  );
}