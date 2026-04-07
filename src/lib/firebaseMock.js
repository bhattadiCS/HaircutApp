/**
 * StyleShift AI - Firebase Zero-Java Mock Layer
 * Mirrors the Firebase v9+ modular API using LocalStorage.
 */

// --- Auth Mock ---
class MockUser {
    constructor(email) {
        this.uid = `mock-user-${btoa(email).slice(0, 8)}`;
        this.email = email;
        this.displayName = email.split('@')[0];
        this.isAnonymous = false;
        this.emailVerified = true;
        this.photoURL = '';
    }
}

const authListeners = new Set();
let currentUser = JSON.parse(localStorage.getItem('__styleshift_mock_user__')) || null;

const mockAuth = {
    get currentUser() {
        return currentUser;
    },
    onAuthStateChanged(callback) {
        authListeners.add(callback);
        callback(currentUser);
        return () => authListeners.delete(callback);
    },
    async authStateReady() {
        return currentUser;
    },
};

export const getAuth = () => mockAuth;

export const onAuthStateChanged = (auth, callback) => auth.onAuthStateChanged(callback);

const notifyAuth = () => {
    localStorage.setItem('__styleshift_mock_user__', JSON.stringify(currentUser));
    authListeners.forEach(cb => cb(currentUser));
};

export const signInWithEmailAndPassword = async (_auth, email, _password) => {
    currentUser = new MockUser(email);
    notifyAuth();
    return { user: currentUser };
};

export const createUserWithEmailAndPassword = async (_auth, email, _password) => {
    currentUser = new MockUser(email);
    notifyAuth();
    return { user: currentUser };
};

export const signInWithPopup = async () => {
    currentUser = new MockUser('local.google@styleshift.dev');
    currentUser.displayName = 'Local Google User';
    notifyAuth();
    return { user: currentUser };
};

export const signInWithRedirect = async () => {
    // Simulate redirect by setting user after a tiny delay
    // In a real app this would reload the page, but for mock we can just prepare the result
    const mockUser = new MockUser('local.google.redirect@styleshift.dev');
    mockUser.displayName = 'Local Google Redirect User';
    localStorage.setItem('__styleshift_mock_redirect_user__', JSON.stringify(mockUser));
};

export const getRedirectResult = async () => {
    const saved = localStorage.getItem('__styleshift_mock_redirect_user__');
    if (saved) {
        localStorage.removeItem('__styleshift_mock_redirect_user__');
        currentUser = JSON.parse(saved);
        notifyAuth();
        return { user: currentUser };
    }
    return null;
};


export const updateProfile = async (user, profile) => {
    if (!currentUser || currentUser.uid !== user?.uid) {
        return;
    }

    currentUser = {
        ...currentUser,
        ...profile,
    };
    notifyAuth();
};

export const sendPasswordResetEmail = async () => undefined;
export const deleteUser = async (user) => {
    if (currentUser?.uid !== user?.uid) {
        return;
    }

    currentUser = null;
    notifyAuth();
};

export const signOut = async (_auth) => {
    currentUser = null;
    notifyAuth();
};

export class GoogleAuthProvider {}

GoogleAuthProvider.prototype.setCustomParameters = function setCustomParameters() {};

// --- Firestore Mock ---
const dbListeners = new Map();
let dbListenerId = 0;

const getDB = () => JSON.parse(localStorage.getItem('__styleshift_mock_db__')) || {};
const createDocSnapshot = (path, docData) => ({
    exists: () => !!docData,
    data: () => docData || null,
    id: path.split('/').pop(),
});

const resolveCollectionDocs = (data, collectionPath, queryConstraints = []) => {
    const prefix = `${collectionPath}/`;
    const docs = Object.entries(data)
        .filter(([path]) => path.startsWith(prefix) && !path.slice(prefix.length).includes('/'))
        .map(([path, value]) => ({
            id: path.slice(prefix.length),
            data: () => value,
            exists: () => true,
        }));

    const orderConstraint = queryConstraints.find((constraint) => constraint?.type === 'orderBy');
    if (orderConstraint) {
        const directionFactor = orderConstraint.direction === 'desc' ? -1 : 1;
        docs.sort((left, right) => {
            const leftValue = left.data()?.[orderConstraint.field];
            const rightValue = right.data()?.[orderConstraint.field];

            if (leftValue === rightValue) {
                return 0;
            }

            if (leftValue == null) {
                return -1 * directionFactor;
            }

            if (rightValue == null) {
                return 1 * directionFactor;
            }

            return leftValue > rightValue ? directionFactor : -1 * directionFactor;
        });
    }

    return {
        docs,
        empty: docs.length === 0,
        size: docs.length,
    };
};

const emitListener = (target, callback, data) => {
    if (typeof target === 'string') {
        callback(createDocSnapshot(target, data[target]));
        return;
    }

    if (target?.type === 'query') {
        callback(resolveCollectionDocs(data, target.path, target.constraints));
    }
};

const saveDB = (data) => {
    localStorage.setItem('__styleshift_mock_db__', JSON.stringify(data));
    dbListeners.forEach(({ target, callback }) => {
        emitListener(target, callback, data);
    });
};

export const getFirestore = () => ({});
export const getFunctions = () => ({});

export const doc = (db, ...pathSegments) => pathSegments.join('/');
export const collection = (db, ...pathSegments) => pathSegments.join('/');
export const addDoc = async (collectionPath, content) => {
    const data = getDB();
    const entryId = globalThis.crypto?.randomUUID?.() || `mock-doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const docPath = `${collectionPath}/${entryId}`;
    data[docPath] = content;
    saveDB(data);
    return {
        id: entryId,
        path: docPath,
    };
};
export const orderBy = (field, direction = 'asc') => ({ type: 'orderBy', field, direction });
export const query = (collectionPath, ...constraints) => ({ type: 'query', path: collectionPath, constraints });

export const getDoc = async (path) => {
    const data = getDB();
    const docData = data[path];
    return createDocSnapshot(path, docData);
};
export const getDocs = async (target) => {
    if (typeof target === 'string') {
        return resolveCollectionDocs(getDB(), target);
    }

    return resolveCollectionDocs(getDB(), target.path, target.constraints);
};

export const setDoc = async (path, content, options = {}) => {
    const data = getDB();
    data[path] = options.merge ? { ...(data[path] || {}), ...content } : content;
    saveDB(data);
};

export const updateDoc = async (path, content) => {
    const data = getDB();
    data[path] = { ...(data[path] || {}), ...content };
    saveDB(data);
};
export const deleteDoc = async (path) => {
    const data = getDB();
    delete data[path];
    saveDB(data);
};

export const onSnapshot = (path, callback) => {
    const listenerId = `listener-${dbListenerId += 1}`;
    dbListeners.set(listenerId, { target: path, callback });

    const data = getDB();
    emitListener(path, callback, data);

    return () => dbListeners.delete(listenerId);
};

export const httpsCallable = (_functions, name) => async (_payload) => {
    if (name === 'deleteAccountCascade' && currentUser?.uid) {
        const data = getDB();
        const userPath = `users/${currentUser.uid}`;

        Object.keys(data)
            .filter((path) => path === userPath || path.startsWith(`${userPath}/`))
            .forEach((path) => delete data[path]);

        saveDB(data);
        currentUser = null;
        notifyAuth();
    }

    return { data: { ok: true } };
};

export const deleteAccountCascadeRequest = async (_payload) => {
    if (!currentUser?.uid) {
        return { ok: true };
    }

    const data = getDB();
    const userPath = `users/${currentUser.uid}`;

    Object.keys(data)
        .filter((path) => path === userPath || path.startsWith(`${userPath}/`))
        .forEach((path) => delete data[path]);

    saveDB(data);
    currentUser = null;
    notifyAuth();

    return { ok: true };
};

// --- Storage Mock ---
export const getStorage = () => ({});
export const ref = (_storage, path) => path;
export const uploadBytes = async (storageRef, _blob) => ({ ref: storageRef });
export const getDownloadURL = async () =>
    'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"%3E%3Cdefs%3E%3ClinearGradient id="g" x1="0" y1="0" x2="1" y2="1"%3E%3Cstop offset="0%25" stop-color="%23020617"/%3E%3Cstop offset="100%25" stop-color="%23111827"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="512" height="512" rx="96" fill="url(%23g)"/%3E%3Ccircle cx="256" cy="200" r="96" fill="%23f8fafc" fill-opacity="0.92"/%3E%3Cpath d="M96 432c44-80 100-120 168-120s124 40 168 120" fill="%2367e8f9" fill-opacity="0.26"/%3E%3Ctext x="256" y="466" text-anchor="middle" fill="%23f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="38"%3EStyleShift Mock%3C/text%3E%3C/svg%3E';
export const deleteObject = async () => undefined;
