
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBF8TAaSUK1sKQHIY4Rk__2bYERNzEXKPk",
  authDomain: "stem-ct-3afd6.firebaseapp.com",
  projectId: "stem-ct-3afd6",
  storageBucket: "stem-ct-3afd6.firebasestorage.app",
  messagingSenderId: "434479464476",
  appId: "1:434479464476:web:235ea1dcfb81c5b19d1fd9",
  measurementId: "G-6RD727L0ZZ"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);


let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { app, auth, analytics };