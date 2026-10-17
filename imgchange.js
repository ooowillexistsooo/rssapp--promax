window.addEventListener('DOMContentLoaded', () => {
    const images = [
        'static/404-1.png',
        'static/404-2.png',
        'static/404-3.png'
    ];

    const randomIndex = Math.floor(Math.random() * images.length);
    const image = document.getElementById('image');
    image.src = images[randomIndex]
})