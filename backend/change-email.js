import {auth} from "./firebase-config.js";
import {
    onAuthStateChanged,
    verifyBeforeUpdateEmail
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

const form = document.getElementById("change-email-form");
const emailInput = document.getElementById("new-email");
const message = document.getElementById("email-change-message");

let currentUser = null;

onAuthStateChanged(
    auth,
    user => {
        currentUser = user;
    },
    error => {
        message.textContent = `could not check signin status: ${error.message}`;
    }
);

form.addEventListener("submit", async event => {
    event.preventDefault();

    if (!currentUser) {
        message.textContent = "sign in my brotatochip";
        return;
    }

    const newEmail = emailInput.value.trim();

    try {
        await verifyBeforeUpdateEmail(currentUser, newEmail, {
            url: new URL("../signin/signin.html", window.location.href).href,
            handleCodeInApp: true
        });
        message.textContent = "Check your new email address for a verification link.";
        form.reset();
    } catch (error) {
        message.textContent = 
            error.code === "auth/requires-recent-login"
                ? "for security, please log out and log in again before trying this again."
                : `Could not start email change: ${error.message}`;
    }
});