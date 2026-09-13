import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

import firebaseConfig from '../firebase-applet-config.json';

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || firebaseConfig.projectId;

const credential =
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL && privateKey
    ? cert({
        projectId,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey,
      })
    : applicationDefault();

const adminApp =
  getApps()[0] ||
  initializeApp({
    credential,
    projectId,
  });

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
