const words = ["love", "tea", "anything but react", "hatred", "memes", "lots of reading inbetween coding dont blame me it gets tiring"];
const subtitles = [
    "welcome folks",
    "made with anger and disgust",
    "workin 9-5... what a way to make a livin'..",
    "avocadoe",
    "all hail freg the frog",
    "did you know this was made for hack club terra?",
    "the words at the bottom of the site change, you know",
    "i want a blahaj",
    "just keep reading just keep reading just keep reading doot doot doo",
    "you should get the feed from The Verge, they're pretty cool"
]
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typeSpeed = 150;
const eraseSpeed = 100;
const pauseTime = 1500;

const targetSpan = document.getElementById("changing-text");

function typeEffect() {
  const currentWord = words[wordIndex];
  
  if (isDeleting) {
    targetSpan.textContent = currentWord.substring(0, charIndex - 1);
    charIndex--;
  } else {
    targetSpan.textContent = currentWord.substring(0, charIndex + 1);
    charIndex++;
  }

  let nextSpeed = isDeleting ? eraseSpeed : typeSpeed;

  if (!isDeleting && charIndex === currentWord.length) {
    nextSpeed = pauseTime;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    wordIndex = (wordIndex + 1) % words.length;
    nextSpeed = 500;
  }

  setTimeout(typeEffect, nextSpeed);
}

document.addEventListener("DOMContentLoaded", typeEffect);
window.addEventListener("DOMContentLoaded", () => {
    const randomIndex = Math.floor(Math.random() * subtitles.length);
    const subtitleElement = document.getElementById("subtitle");
    subtitleElement.textContent = subtitles[randomIndex];
});