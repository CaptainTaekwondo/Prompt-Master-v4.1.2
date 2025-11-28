// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCRUwidlS--hSsFWgVV68ntwr3farxbbd8",
  authDomain: "studio-2065102759-679de.firebaseapp.com",
  projectId: "studio-2065102759-679de",
  storageBucket: "studio-2065102759-679de.firebasestorage.app",
  messagingSenderId: "1053702610448",
  appId: "1:1053702610448:web:65f70de66e53fc50223495"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);