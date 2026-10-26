import {auth, db} from "./firebase-config.js";
import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";
import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

const localStorageKey = "customFeedCss";
const styleId = "user-custom-feed-css";
const form = document.getElementById("custom-feed-css-form");
const textarea = document.getElementById("custom-feed-css");
const status = document.getElementById("custom-feed-css-status");

let currentUser = null;
let cssReady = false;

function applyCss(css) {
    let style = document.getElementById(styleId);

    if (!style) {
        style = document.createElement("style");
        style.id = styleId;
        document.head.append(style);
    }

    style.textContent = css;
}

async function loadCss(user) {
    if (!user) {
        return localStorage.getItem(localStorageKey) || "";
    }

    const snapshot = await getDoc(doc(db, "users", user.uid));
    return snapshot.exists() ? snapshot.data().customFeedCss || "" : "";
}

onAuthStateChanged(
    auth,
    async user => {
        currentUser = user;
        cssReady = false;
        status && (status.textContent = "Loading custom CSS...");

        try {
            const css = await loadCss(user);
            applyCss(css);
            
            if (textarea) {
                textarea.value = css;
            }

            cssReady = true;
            if (status) status.textContent = "";
        } catch (error) {
            console.error("Could not load custom CSS:", error);
            if (status) {
                status.textContent = `could not load custom css: ${error.message}`
            }
        }
    },
    error => {
        console.error("Could not check sign-in status:", error);
        if (status) {
            status.textContent = `Could not check sign-in status: ${error.message}`;
        }
    }
);

form?.addEventListener("click", async event => {
    event.preventDefault();
    if (!cssReady) {
        status.textContent = "Custom css is still loading...";
        return;
    }

    const css = textarea.value;

    try {
        if (currentUser) {
            await setDoc(
                doc(db, "users", currentUser.uid),
                {customFeedCss: css},
                {merge: true}
            );
        } else {
            localStorage.setItem(localStorageKey, css);
        }

        applyCss(css);
        status.textContent = "saved."
    } catch (error) {
        console.error("could not save css:", error);
        status.textContent = `could not save css: ${error.message}`;
    }
});