const storageKey = "rssFeeds";
const feedProxyUrl = "https://rssfetch.willafiala.workers.dev/";
const form = document.getElementById("new-rss-form");
const list = document.getElementById("feed-list");
const modal = document.getElementById("new-rss-modal");

function getFeeds() {
    try {
        const feeds = JSON.parse(localStorage.getItem(storageKey) || "[]");
        return Array.isArray(feeds) ? feeds : [];
    } catch {
        return [];
    }
}

function saveFeeds(feeds) {
    localStorage.setItem(storageKey, JSON.stringify(feeds));
}

async function renderFeeds() {
    list.replaceChildren();

    const feeds = getFeeds();
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
        remove.addEventListener("click", () => {
            saveFeeds(getFeeds().filter(item => item.url !== feed.url));
            renderFeeds();
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

            const titles = [...xml.querySelectorAll("item, entry")]
                .slice(0,5)
                .map(item => item.querySelector("title")?.textContent?.trim())
                .filter(Boolean);

            status.textContent = titles.length ? titles.join(" | ") : "No posts found.";
        } catch {
            status.textContent = "Could not load this feed. It may block browser requests"
        }
    }
}

form.addEventListener("submit", event => {
    event.preventDefault();

    const title = document.getElementById("feed-title").value.trim();
    const url = new URL(document.getElementById("feed-url").value.trim());
    if (url.protocol !== "https:") return;

    const feeds = getFeeds();
    if (feeds.some(feed => feed.url === url.href)) return;

    feeds.push({title, url: url.href});
    saveFeeds(feeds);
    form.reset();
    modal.close();
    renderFeeds();
});

renderFeeds();