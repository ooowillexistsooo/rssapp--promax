const rssmodal = document.getElementById('new-rss-modal');
const openBtn = document.getElementById('new');
const closeBtn = document.getElementById('close-modal');

openBtn.addEventListener('click', () => {
    rssmodal.showModal();
});

closeBtn.addEventListener('click', () => {
    rssmodal.close();
});