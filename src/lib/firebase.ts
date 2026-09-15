import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim();
export const isFirebaseConfigured = Boolean(
  rawApiKey && rawApiKey !== 'Set VITE_FIREBASE_API_KEY in your environment'
);

const apiKey = isFirebaseConfigured ? rawApiKey : 'AIzaSyPreviewDummyKeyWhenUnset';

const app = initializeApp({ ...firebaseConfig, apiKey });
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
