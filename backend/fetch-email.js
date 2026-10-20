import {auth} from "../backend/firebase-config.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

const emailDisplay = document.getElementById("signed-in-email");
const logoutButton = document.getElementById("logout-btn");
const message = document.getElementById("account-message");

onAuthStateChanged(auth, (user) => {
    emailDisplay.textContent = user?.email ?? "Not signed in."
    logoutButton.hidden = !user;
});

logoutButton.addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.href = "../signin/signin.html";
    } catch (error) {
        message.textContent = `Could not log out. ${error.message};}`;
    }
})