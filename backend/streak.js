(() => {
const storageKey = "fregStreak";
const button = document.getElementById("freg-streak-toggle");
const statusText = document.getElementById("freg-streak-status");
const goalSeconds = 120;

function localDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getYesterdayKey(date = new Date()) {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    return localDateKey(yesterday);
}

const state = JSON.parse(localStorage.getItem(storageKey) || "null") || {
    count: 0,
    lastCompletedDate: null,
    trackedDate: localDateKey(),
    secondsToday: 0
};

function saveState() {
    localStorage.setItem(storageKey, JSON.stringify(state));
}

function updateTrackedDay() {
    const today = localDateKey();

    if (state.trackedDate !== today) {
        state.trackedDate = today;
        state.secondsToday = 0;
        saveState();
    }

    return today;
}

let isTracking = false;

function render() {
    const today = updateTrackedDay();
    const streakIsActive =
        state.lastCompletedDate === today ||
        state.lastCompletedDate === getYesterdayKey(new Date());
    const displayedCount = streakIsActive ? state.count : 0;
    const displayedSeconds = Math.min(state.secondsToday, goalSeconds);
    const minutes = Math.floor(displayedSeconds / 60);
    const seconds = displayedSeconds % 60;
    const goalMinutes = Math.floor(goalSeconds / 60);
    const goalRemainder = goalSeconds % 60;
    const goalText =
        `${goalMinutes}:${String(goalRemainder).padStart(2, "0")}`;

    statusText.textContent =
        `Streak: ${displayedCount} day(s)! Today: ${minutes}:${String(seconds).padStart(2, "0")} / ${goalText}`;
    button.textContent = isTracking ? "pause reading" : "start reading";
}

button.addEventListener("click", () => {
    isTracking = !isTracking;
    render()
});

setInterval(() => {
    const previousTrackedDate = state.trackedDate;
    const today = updateTrackedDay();

    if (state.trackedDate !== previousTrackedDate) {
        render();
    }

    if (
        !isTracking ||
        document.visibilityState !== "visible" ||
        !document.hasFocus() ||
        state.lastCompletedDate === today
    ) {
        return;
    }

    state.secondsToday = Math.min(state.secondsToday + 1, goalSeconds);

    if (state.secondsToday >= goalSeconds) {
        state.count =
            state.lastCompletedDate === getYesterdayKey(new Date())
                ? state.count + 1
                : 1;
        state.lastCompletedDate = today;
    }

    saveState();
    render();
}, 1000);

if (!document.hasFocus()) {
    document.title = "noo come back!!";
}

render();
})();