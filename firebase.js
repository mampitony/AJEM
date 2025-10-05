import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration Firebase - Remplacez par votre configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxLAayFYRMqnhc7KXdfI18NhqkF_T4LoI",
  authDomain: "comptable-8c2df.firebaseapp.com",
  projectId: "comptable-8c2df",
  storageBucket: "comptable-8c2df.firebasestorage.app",
  messagingSenderId: "912552456282",
  appId: "1:912552456282:web:6547d216dc1da85b20e863"
};
// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser l'authentification et Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;