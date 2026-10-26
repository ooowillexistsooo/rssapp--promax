import {auth, db} from "../backend/firebase-config.js";
import {
    deleteUser
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import {
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

const deleteButton = document.getElementById("deleteAcctBtn");
const deleteModal = document.getElementById("delete-account-modal");
const message = document.getElementById("account-message");

deleteButton.addEventListener("click", async () =>{
    const user = auth.currentUser;

    if (!user) {
        message.textContent = "sign in before deleting an account bri";
        return;
    }

    let feedDataDeleted = false;

    try {
        await deleteDoc(doc(db, "users", user.uid));
        feedDataDeleted = true;
        await deleteUser(user);
        deleteModal.close();
        window.location.href = "../signin/signin.html";
    } catch (error) {
        if (feedDataDeleted && error.code === "auth/requires-recent-login") {
            message.textContent = "Your feed data was deleted. For security, sign out and sign back in, then retry account deletion.";
        } else if (error.code === "auth/requires-recent-login") {
            message.textContent = "For security, sign out and sign back in, then retry account deletion.";
        } else if (feedDataDeleted) {
            message.textContent = `Your feed data was deleted, but the account could not be deleted: ${error.message}`;
        } else {
            message.textContent = `Could not delete account data. Your account is still active. ${error.message}`;
        }
    }
});