// firebase-init.js
// Loads Firebase (modular SDK, v10) from CDN and exposes a small,
// promise-based API on `window.FB` so the rest of the app (script.js,
// a plain classic script) can use auth without dealing with ES modules.
//
// >>> FILL IN YOUR FIREBASE CONFIG BELOW (see README.md) <<<

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDzgxAv1vGbErjufKpT9FnkmT-szZyHt9M",
  authDomain: "efromatika.firebaseapp.com",
  projectId: "efromatika",
  storageBucket: "efromatika.firebasestorage.app",
  messagingSenderId: "200835488217",
  appId: "1:200835488217:web:c0234a5a59af574b6361c8",
  measurementId: "G-KTH0DGEM60"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Session-only persistence: closing the browser tab/window ends the
// session. Combined with the 5-minute idle auto-logout implemented in
// script.js, this satisfies the "cookie-like session" requirement
// without needing a real server-set cookie (Firebase Auth in a static
// site cannot set httpOnly cookies on its own).
setPersistence(auth, browserSessionPersistence).catch((err) => {
  console.error("Gagal mengatur persistence:", err);
});

window.FB = {
  ready: true,
  signIn: (email, password) => signInWithEmailAndPassword(auth, email, password),
  signOutUser: () => signOut(auth),
  onAuthChange: (cb) => onAuthStateChanged(auth, cb),
  auth
};

// Let script.js (loaded as a classic, deferred script) know Firebase
// is initialized, in case it started listening before this module
// finished evaluating.
window.dispatchEvent(new Event("fb-ready"));
