import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import {
    getAuth,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

// of course, replace "something" with your actual values.
const firebaseConfig = {
    apiKey: "something",
    authDomain: "something.firebaseapp.com",
    projectId: "something",
    storageBucket: "something.firebasestorage.app",
    messagingSenderId: "something",
    appId: "something",
    measurementId: "something"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export {
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink
};
export const db = getFirestore(app);