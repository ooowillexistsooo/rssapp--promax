import {db} from "./firebase-config.js";
import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

const storageKey = "rssFeeds";

function getLocalFeeds() {
    try {
        const feeds = JSON.parse(localStorage.getItem(storageKey) || "[]");
        return Array.isArray(feeds) ? feeds : [];
    } catch {
        return [];
    }
}

export async function loadFeeds(user) {
    if (!user) return getLocalFeeds();

    const userDoc = doc(db, "users", user.uid);
    const snapshot = await getDoc(userDoc);

    if (snapshot.exists()) {
        const feeds = snapshot.data().feeds;
        if (!Array.isArray(feeds)) {
            throw new Error("saved account feeds are in invalid format")
        }
        return feeds;
    }

    const localFeeds = getLocalFeeds();
    await setDoc(userDoc, {feeds: localFeeds}, {merge: true});
    return localFeeds;
}

export async function saveFeeds(user, feeds) {
    if (user) {
        await setDoc(doc(db, "users", user.uid), {feeds}, {merge: true});
    } else {
        localStorage.setItem(storageKey, JSON.stringify(feeds));
    }
}