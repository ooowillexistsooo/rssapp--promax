import {auth} from "./firebase-config.js";
import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import { loadFeeds, saveFeeds } from "./feed-storage.js";

let currentUser = null;
let feeds = [];
let feedsLoaded = false;
const feedProxyUrl = "https://rssfetch.willafiala.workers.dev/";
const form = document.getElementById("new-rss-form");
const list = document.getElementById("feed-list");
const modal = document.getElementById("new-rss-modal");
const postModal = document.getElementById("post-modal");
const postModalTitle = document.getElementById("post-modal-title");
const postModalContent = document.getElementById("post-modal-content");

function getPostText(entry) {
    const content = 
        entry.getElementsByTagNameNS("*", "encoded")[0] ??
        entry.querySelector("content, description, summary");

    const rawText = content?.textContent?.trim() ?? "";
    if (!rawText) return "This feed does not include post text."

    const parsedHtml = new DOMParser().parseFromString(rawText, "text/html");
    return parsedHtml.body.textContent?.trim() || rawText;
}

function showPost(title, text) {
    postModalTitle.textContent = title;
    postModalContent.textContent = text;
    postModal.showModal();
}

document.getElementById("close-post-modal").addEventListener("click", () => {
    postModal.close();
})

async function renderFeeds() {
    list.replaceChildren();

    if (feeds.length === 0) {
        const emptyState = document.createElement("p");
        emptyState.textContent = "No feeds yet. Add an RSS feed to get started.";
        list.append(emptyState);
        return;
    }

    for (const feed of feeds) {
        const section = document.createElement("section");
        const heading = document.createElement("h3");
        const status = document.createElement("p");
        const remove = document.createElement("button");

        heading.textContent = feed.title;
        status.textContent = "Loading...";
        remove.textContent = "Remove feed";
        remove.addEventListener("click", async () => {
            const updatedFeeds = feeds.filter(item => item.url !== feed.url);
            try {
                await saveFeeds(currentUser, updatedFeeds);
                feeds = updatedFeeds;
                await renderFeeds();
            } catch (error) {
                console.error("Could not remove feed:", error);
                status.textContent = "Could not remove this feed. Please try again.";
            }
        });

        section.append(heading, status, remove);
        list.append(section);

        try {
            const proxyUrl = new URL(feedProxyUrl);
            proxyUrl.searchParams.set("url", feed.url);
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const xml = new DOMParser().parseFromString(
                await response.text(),
                "application/xml"
            );
            if (xml.querySelector("parsererror")) throw new Error("Invalid feed XML");

            const posts = [...xml.querySelectorAll("item, entry")].slice(0,5);

            if (posts.length === 0) {
                status.textContent = "no posts found.";
            } else {
                status.textContent = "latest posts:";

                for (const post of posts) {
                    const title = post.querySelector("title")?.textContent?.trim() || "Untitled post";
                    const button = document.createElement("button");

                    button.type = "button"
                    button.textContent = title;
                    button.classList.add("post-button")
                    button.addEventListener("click", () => {
                        showPost(title, getPostText(post));
                    });

                    section.append(button);
                }
            }
        } catch {
            status.textContent = "Could not load this feed. It may block browser requests"
        }
    }
}

form.addEventListener("submit", async event => {
    event.preventDefault();

    if (!feedsLoaded) {
        list.textContent = "Feeds are still loading. Please try again in a moment.";
        return;
    }

    const title = document.getElementById("feed-title").value.trim();
    const url = new URL(document.getElementById("feed-url").value.trim());
    if (url.protocol !== "https:") return;

    if (feeds.some(feed => feed.url === url.href)) return;

    const updatedFeeds = [...feeds, {title, url: url.href}];
    try {
        await saveFeeds(currentUser, updatedFeeds);
        feeds = updatedFeeds;
        form.reset();
        modal.close();
        await renderFeeds();
    } catch (error) {
        console.error("Could not save feed:", error);
        list.textContent = "Could not save this feed. Please try again.";
    }
});

onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    try {
        feeds = await loadFeeds(user);
        feedsLoaded = true;
        await renderFeeds();
    } catch (error) {
        console.error("Could not load account feeds:", error);
        list.textContent = "Could not load your feeds. Please wait a minute and refresh the page."
    }
});