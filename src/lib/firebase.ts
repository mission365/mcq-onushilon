import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim();

if (!apiKey) {
  throw new Error('Missing VITE_FIREBASE_API_KEY. Add it to your local environment before starting the app.');
}

const app = initializeApp({ ...firebaseConfig, apiKey });
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export default app;
