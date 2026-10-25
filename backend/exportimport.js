import { auth } from "./firebase-config.js";
import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import { loadFeeds, saveFeeds } from "./feed-storage.js";

const exportButton = document.getElementById("export-feeds");
const importButton = document.getElementById("import-feeds");
const fileUpload = document.getElementById("import-feeds-file");
const statusText = document.getElementById("feed-transfer-status");

let unsubscribeAuth;
const userReady = new Promise((resolve, reject) => {
    unsubscribeAuth = onAuthStateChanged(
        auth,
        user => {
            unsubscribeAuth();
            resolve(user);
        },
        reject
    );
});

async function getCurrentUser() {
    await userReady;
    return auth.currentUser;
}

exportButton.addEventListener("click", async () => {
    try {
        const user = await getCurrentUser();
        const feeds = await loadFeeds(user);

        const file = new Blob(
            [JSON.stringify({version: 1, feeds}, null, 2)],
            {type: "application/json"}
        );
        const link = document.createElement("a");
        const fileUrl = URL.createObjectURL(file);
        link.href = fileUrl;
        link.download = "rss-feeds.json";
        link.click();
        URL.revokeObjectURL(fileUrl);

        statusText.textContent = "feeds exported";
    } catch (error) {
        statusText.textContent = `Could not export feeds: ${error.message}`;
    }
});

importButton.addEventListener("click", () => fileUpload.click());

fileUpload.addEventListener("change", async () => {
    const file = fileUpload.files[0];
    if (!file) return;

    try {
        const imported = JSON.parse(await file.text());

        if (!Array.isArray(imported.feeds)) {
            throw new Error("This file must contain a feeds array.");
        }

        const newFeeds = imported.feeds.map((feed) => {
            if (
                typeof feed.title !== "string" ||
                typeof feed.url !== "string"
            ) {
                throw new Error("feed needs title and url");
            }

            const url = new URL(feed.url);
            if (url.protocol !== "https:") {
                throw new Error("feed URLs must use https");
            }

            return {title: feed.title.trim(), url: url.href};
        });

        const user = await getCurrentUser();
        const savedFeeds = await loadFeeds(user);

        const existingUrls = new Set(savedFeeds.map((feed) => feed.url));
        const mergedFeeds = [...savedFeeds];
        for (const feed of newFeeds) {
            if (!existingUrls.has(feed.url)) {
                mergedFeeds.push(feed);
                existingUrls.add(feed.url);
            }
        }

        await saveFeeds(user, mergedFeeds);
        statusText.textContent = `Imported ${mergedFeeds.length - savedFeeds.length} new feed(s)`;
    } catch (error) {
        statusText.textContent = `Could not import feeds: ${error.message}`;
    } finally {
        fileUpload.value = "";
    }
});