import {auth} from "./firebase-config.js";
import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import {loadFeeds, saveFeeds} from "./feed-storage.js";

const list = document.getElementById("feed-editor-list");
const status = document.getElementById("feed-editor-status");

let currentUser = null;
let feeds = [];
let feedsReady = false;

function renderFeeds() {
    list.replaceChildren();

    if (feeds.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "no saved feeds.";
        list.append(emptyMessage);
        return;
    }

    feeds.forEach((feed, index) => {
        const section = document.createElement("section");
        const title = document.createElement("h4");
        const url = document.createElement("p");
        const editButton = document.createElement("button");
        const deleteButton = document.createElement("button");

        title.textContent = feed.title;
        url.textContent = feed.url;

        editButton.type = "button";
        editButton.textContent = "edit title";
        editButton.addEventListener("click", () => {
            const editForm = document.createElement("form");
            const titleInput = document.createElement("input");
            const saveButton = document.createElement("button");
            const cancelButton = document.createElement("button");

            titleInput.type = "text";
            titleInput.value = feed.title;
            titleInput.required = true;
            titleInput.setAttribute("aria-label", `Title for ${feed.title}`);

            saveButton.type = "submit";
            saveButton.textContent = "save title";
            cancelButton.type = "button";
            cancelButton.textContent = "cancel";
            cancelButton.addEventListener("click", renderFeeds);

            editForm.addEventListener("submit", async event => {
                event.preventDefault();
                const trimmedTitle = titleInput.value.trim();
                if (!trimmedTitle) {
                    status.textContent = "Feed title cannot be empty.";
                    return;
                }

                const updatedFeeds = feeds.map((item, itemIndex) =>
                    itemIndex === index ? {...item, title: trimmedTitle} : item
                );

                await persistFeeds(updatedFeeds);
            });

            editForm.append(titleInput, saveButton, cancelButton);
            section.append(editForm);
            titleInput.focus();
        });

        deleteButton.type = "button";
        deleteButton.textContent = "delete feed";
        deleteButton.addEventListener("click", () => {
            const confirmation = document.createElement("div");
            const prompt = document.createElement("p");
            const confirmButton = document.createElement("button");
            const cancelButton = document.createElement("button");

            prompt.textContent = `Delete "${feed.title}"?`;
            confirmButton.type = "button";
            confirmButton.textContent = "confirm delete";
            cancelButton.type = "button";
            cancelButton.textContent = "keep feed";
            cancelButton.addEventListener("click", renderFeeds);
            confirmButton.addEventListener("click", async () => {
                confirmButton.disabled = true;
                cancelButton.disabled = true;

                const updatedFeeds = feeds.filter((_, itemIndex) => itemIndex !== index);
                const saved = await persistFeeds(updatedFeeds);
                if (!saved) renderFeeds();
            });

            confirmation.append(prompt, confirmButton, cancelButton);
            section.append(confirmation);
            deleteButton.disabled = true;
            editButton.disabled = true;
        });

        section.append(title, url, editButton, deleteButton);
        list.append(section);
    });
}

async function persistFeeds(updatedFeeds) {
    if (!feedsReady) {
        status.textContent = "Feeds are still loading. Please try again soon.";
        return false;
    }

    status.textContent = "Saving...";

    try {
        await saveFeeds(currentUser, updatedFeeds);
        feeds = updatedFeeds;
        renderFeeds();
        status.textContent = "feed changes saved";
        return true;
    } catch (error) {
        console.error("could not save changes:", error);
        status.textContent = `Could not save feed changes: ${error.message}`;
        return false;
    }
}

onAuthStateChanged(
    auth,
    async user => {
        currentUser = user;
        feedsReady = false;
        status.textContent = "Loading feeds...";

        try {
            feeds = await loadFeeds(user);
            feedsReady = true;
            renderFeeds();
            status.textContent = "";
        } catch (error) {
            console.error("Could not load feeds:", error);
            status.textContent = `Could not load feeds: ${error.message}`;
        }
    },
    error => {
        console.error("could not check sign in staus:", error);
        status.textContent = `Could not check sign-in status: ${error.message}`;
    }
);