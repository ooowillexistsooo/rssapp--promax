const tourSteps = [
    {
        text: "Hello, welcome to rss app ++ pro max!"
    },
    {
        text: "In this tour, i, freg, will show you around!"
    },
    {
        elementId: "streak",
        text: "This is your freg streak, where I will count the days you read and give you a streak based off that."
    },
    {
        elementId: "streak",
        text: "The bigger your streak, the more happy i am. But if you break it, i will be very very many very angry"
    },
    {
        elementId: "new",
        text: "This is where you can add new rss feeds to your main feed."
    },
    {
        elementId: "new",
        text: "If you don't know of any you want uhhh"
    },
    {
        elementId: "new",
        text: "Subscribe to the Verge's they make great tech news."
    },
    {
        elementId: "post",
        text: "This is where your posts show up!"
    },
    {
        elementId: "post",
        text: "once you add a feed of your own this demo will go away."
    },
    {
        elementId: "everythign",
        text: "that's about it! if you need to go over this again, just come talk to me at the freg streak area."
    },
    {
        elementId: "everythign",
        text: "bye love you!"
    }
];

let currentStep = 0;
let textTimer = null;
let isTyping = false;
let completeText = "";

const tourBox = document.getElementById("tour-box");
const tourText = document.getElementById("tour-text");
const nextBtn = document.getElementById("tour-next-button");
const skipBtn = document.getElementById("tour-skip-button");
const tourSeenKey = "rssAppTourSeen";

function startTour(force = false) {
    if (!force && localStorage.getItem(tourSeenKey)) {
        return;
    }

    localStorage.setItem(tourSeenKey, "true");
    currentStep = 0;
    tourBox.classList.remove("tour-hidden");
    showStep();
}

function showStep() {
    document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));

    if (currentStep < tourSteps.length) {
        const step = tourSteps[currentStep];
        completeText = step.text;

        const targetElement = document.getElementById(step.elementId);
        if (targetElement) {
            targetElement.classList.add("tour-highlight");
            targetElement.scrollIntoView({behavior: 'smooth', block: "center"});
        }

        typewriterEffect(completeText);
    } else {
        endTour();
    }
}

function typewriterEffect(text) {
    clearInterval(textTimer)
    isTyping = true;
    tourText.textContent = "";
    let index = 0;

    textTimer = setInterval(() => {
        if (index < text.length) {
            tourText.textContent += text.charAt(index);
            index++;
        } else {
            clearInterval(textTimer);
            isTyping = false;
        }
    }, 30);
}

nextBtn.addEventListener("click", () => {
    if (isTyping) {
        clearInterval(textTimer);
        tourText.textContent = completeText;
        isTyping = false;
    } else {
        currentStep++;
        showStep();
    }
});

skipBtn.addEventListener("click", endTour);

document.addEventListener("keydown", (event) => {
    if (event.code !== "Space" || event.repeat || tourBox.classList.contains("tour-hidden")) {
        return;
    }

    event.preventDefault();
    nextBtn.click();
});

function endTour() {
    clearInterval(textTimer);
    tourBox.classList.add("tour-hidden");
    document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
}

window.addEventListener("load", () => startTour());

function iloveyou() {
    const response = document.getElementById("response");
    response.textContent = "oh thats wonderful";
}