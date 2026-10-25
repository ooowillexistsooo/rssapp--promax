import {
    auth,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink
} from "./firebase-config.js";

const authForm = document.getElementById("authForm");
const emailInput = document.getElementById("email");
const messageEl = document.getElementById("message");

const actionCodeSettings = {
    url: new URL(window.location.pathname, window.location.origin).href,
    handleCodeInApp: true
};

authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();

    try {
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem("emailForSignIn", email);
        messageEl.style.color = "#2e7d32";
        messageEl.textContent = "A sign-in link has been sent to your email!";
    } catch (error) {
        messageEl.style.color = "#c62828";
        messageEl.textContent = `oh dear! an error. ${error.message}`;
    }
});

if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem("emailForSignIn");
    if (!email) {
        email = window.prompt("please retype your email for security!");
    }

    if (!email) {
        messageEl.style.color = "#c62828";
        messageEl.textContent = "Enter the email address that received the sign-in link.";
    } else {
        signInWithEmailLink(auth, email, window.location.href)
        .then((result) => {
            window.localStorage.removeItem("emailForSignIn");
            messageEl.style.color = "#2e7d32";
            messageEl.textContent = `login done. welcome, ${result.user.email}!!!`;
            window.location.href = "../app/index.html";
        })
        .catch((error) => {
            messageEl.style.color = "#c62828";
            messageEl.textContent = `oh dear! an error. ${error.message}`;
        });
    }
}