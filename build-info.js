const GITHUB_USERNAME = 'ooowillexistsooo';
const REPO_NAME = 'rssapp--promax';
const BRANCH = 'main';

async function fetchLatestCommit() {
    const container = document.getElementById('deployment-info')
    const apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/commits/${BRANCH}`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/vnd.github+json'
            }
        });
        if (!response.ok) {
            throw new Error(`Github API responded with status ${response.status}`);
        }

        const data = await response.json();
        const fullSha = data.sha;
        const shortSha = fullSha.substring(0, 7);
        const commitUrl = data.html_url;
        container.innerHTML = `Last built via commit: <a href="${commitUrl}" target="_blank" rel="noreferrer">${shortSha}</a>`;
    } catch (error) {
        console.error('Error fetching commit:', error);
        container.innerHTML = 'Version info unavailable';
    }
}

document.addEventListener('DOMContentLoaded', fetchLatestCommit);