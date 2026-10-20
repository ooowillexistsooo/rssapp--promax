const iqQuestions = [
    {
        question: "which number comes next in the sequence? 2, 4, 8, 10, 32, ...",
        options: ["48", "64", "54", "72"],
        correct: 1
    },
    {
        question: "book is to reading as fork is to...",
        options: ["drawing", "writing", "eating", "murder"],
        correct: 2
    },
    {
        question: "If all fregs are frogs and all frogs are fredrith, are all fregs fredrith?",
        options: ["True", "False"],
        correct: 0
    },
    {
        question: "Which word is not like the others???",
        options: ["Leopard", "Tiger", "Cheetah", "Wolf"],
        correct: 3
    },
    {
        question: "What is the missing number? 100, 95, 85, 70, 50, ...",
        options: ["25", "30", "20", "45"],
        correct: 0
    }
];

let currentQuestionIndex = 0;
let correctAnswersCount = 0;

const welcomeScreen = document.getElementById('welcome-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');

const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const progressBar = document.getElementById('progress');

const iqScoreDisplay = document.getElementById('iq-score');
const iqClassificationDisplay = document.getElementById('iq-classification');
const redirect = document.getElementById('redirect')

startBtn.addEventListener('click', startTest);
restartBtn.addEventListener('click', startTest);

function startTest() {
    currentQuestionIndex = 0;
    correctAnswersCount = 0;

    resultsScreen.classList.add('hidden');
    welcomeScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');

    loadQuestion();
}

function loadQuestion() {
    const currentQuestion = iqQuestions[currentQuestionIndex];

    const progressPercentage = (currentQuestionIndex/iqQuestions.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    questionText.textContent = currentQuestion.question;
    optionsContainer.innerHTML = '';
    currentQuestion.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.classList.add('option-btn');
        button.textContent = option;
        button.addEventListener('click', () => handleAnswer(index));
        optionsContainer.appendChild(button);
    });
}

function handleAnswer(selectedIndex) {
    const currentQuestion = iqQuestions[currentQuestionIndex];
    if (selectedIndex === currentQuestion.correct) {
        correctAnswersCount++;
    }

    currentQuestionIndex++;

    if (currentQuestionIndex < iqQuestions.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    quizScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');
    progressBar.style.width = '100%'

    const scorePercentage = correctAnswersCount / iqQuestions.length;
    const estimatedIq = Math.round(70 + (scorePercentage*75));

    iqScoreDisplay.textContent = estimatedIq;

    let classification = "";
    if (estimatedIq >= 130) classification = "genius";
    else if (estimatedIq >= 120) classification = "great";
    else if (estimatedIq >= 110) classification = "good";
    else if (estimatedIq >= 90) classification = "average bro";
    else classification = "dum ahh";

    iqClassificationDisplay.textContent = classification;
}

redirect.addEventListener("click", function() {
    window.location.href = "signin.html";
})