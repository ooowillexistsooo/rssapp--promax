async function updateRssParagraph() {
    const rssUrl = 'https://rss.app/feeds/Mvro7BfVoYRBffwo.xml';
    const feedElement = document.getElementById('test-feed');

    try {
        const response = await fetch(rssUrl);
        if (!response.ok) {
            throw new Error(`RSS feed returned HTTP ${response.status}`);
        }

        const xml = await response.text();
        const feed = new DOMParser().parseFromString(xml, 'application/xml');
        if (feed.querySelector('parsererror')) {
            throw new Error('RSS feed returned invalid XML');
        }

        const latestPostTitle = feed.querySelector('item > title')?.textContent?.trim();
        if (!latestPostTitle) {
            throw new Error('RSS feed contains no posts');
        }

        feedElement.textContent = latestPostTitle;
    } catch (error) {
        console.error('error fetching rss feed:', error);
        feedElement.textContent = 'The demo feed is temporarily unavailable.';
    }
}

updateRssParagraph();