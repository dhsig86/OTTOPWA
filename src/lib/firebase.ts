import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBTsl2qXq3_CwkLUI0bGWRLKbw8xyDvlEo",
  authDomain: "otto-ecosystem.firebaseapp.com",
  projectId: "otto-ecosystem",
  storageBucket: "otto-ecosystem.firebasestorage.app",
  messagingSenderId: "767979353790",
  appId: "1:767979353790:web:1ad09ef2243149199150ef",
  measurementId: "G-W0LP26011Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
