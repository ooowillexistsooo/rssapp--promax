import {auth} from "../backend/firebase-config.js";
import {
    deleteUser
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

const deleteButton = document.getElementById("deleteAcctBtn");
const deleteModal = document.getElementById("delete-account-modal");
const message = document.getElementById("account-message");

deleteButton.addEventListener("click", async () =>{
    const user = auth.currentUser;

    if (!user) {
        message.textContent = "sign in before deleting an account bri";
        return;
    }

    try {
        deleteUser(user);
        deleteModal.close();
        window.location.href = "../signin/signin.html";
    } catch (error) {
        message.textContent =
            error.code === "auth/requires-recent-login"
                ? "for security reasons, please sign out and sign in again."
                : `Could not delete your account. ${error.message}`
    }
});