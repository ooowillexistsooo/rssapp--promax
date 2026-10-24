const storageKey = "rssFeeds";
const exportButton = document.getElementById("export-feeds");
const importButton = document.getElementById("import-feeds");
const fileUpload = document.getElementById("import-feeds-file");
const statusText = document.getElementById("feed-transfer-status");

exportButton.addEventListener("click", () => {
    const feeds = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (!Array.isArray(feeds)) {
        statusText.textContent = "Saved feed data is not in the expected format.";
        return;
    }

    const file = new Blob(
        [JSON.stringify({version: 1, feeds}, null, 2)],
        {type: "application/json"}
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "rss-feeds.json";
    link.click();
    URL.revokeObjectURL(link.href);

    statusText.textContent = "feeds exported";
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

        const savedFeeds = JSON.parse(localStorage.getItem(storageKey) || "[]");
        if (!Array.isArray(savedFeeds)) {
            throw new Error("existing saved feed data not in expected format");
        }

        const existingUrls = new Set(savedFeeds.map((feed) => feed.url));
        const mergedFeeds = [
            ...savedFeeds,
            ...newFeeds.filter((feed) => !existingUrls.has(feed.url))
        ];

        localStorage.setItem(storageKey, JSON.stringify(mergedFeeds));
        statusText.textContent = `Imported ${mergedFeeds.length - savedFeeds.length} new feed(s)`;
    } catch (error) {
        statusText.textContent = `Could not import feeds: ${error.message}`;
    } finally {
        fileUpload.value = "";
    }
});