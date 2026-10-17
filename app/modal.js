const modal = document.getElementById('new-rss-modal');
const openBtn = document.getElementById('new');
const closeBtn = document.getElementById('close-modal');

openBtn.addEventListener('click', () => {
    modal.showModal();
});

closeBtn.addEventListener('click', () => {
    modal.close();
});