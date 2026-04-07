import * as firebaseAuth from 'firebase/auth';
import * as firebaseFirestore from 'firebase/firestore';
import * as firebaseStorage from 'firebase/storage';
import * as mockLayer from './lib/firebaseMock';

export { app, shouldUseEmulators, useMock } from './firebase';
export { firebaseAuth, firebaseFirestore, firebaseStorage, mockLayer };