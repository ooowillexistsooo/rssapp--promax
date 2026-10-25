(() => {
const storageKey = "fregStreak";
const button = document.getElementById("freg-streak-toggle");
const statusText = document.getElementById("freg-streak-status");

function localDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getYesterdayKey() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return localDateKey(yesterday);
}

const today = localDateKey();
const state = JSON.parse(localStorage.getItem(storageKey) || "null") || {
    count: 0,
    lastCompletedDate: null,
    trackedDate: today,
    secondsToday: 0
};

if (state.trackedDate !== today) {
    state.trackedDate = today;
    state.secondsToday = 0;
}

let isTracking = false;

function saveState() {
    localStorage.setItem(storageKey, JSON.stringify(state));
}

function render() {
    const streakIsActive =
        state.lastCompletedDate === today ||
        state.lastCompletedDate === getYesterdayKey();
    const displayedCount = streakIsActive ? state.count : 0;
    const minutes = Math.floor(state.secondsToday / 60);
    const seconds = state.secondsToday % 60;

    statusText.textContent =
        `Streak: ${displayedCount} day(s)! Today: ${minutes}:${String(seconds).padStart(2, "0")} / 2:00`;
    button.textContent = isTracking ? "pause reading" : "start reading";
}

button.addEventListener("click", () => {
    isTracking = !isTracking;
    render()
});

setInterval(() => {
    if (
        !isTracking ||
        document.visibilityState !== "visible" ||
        !document.hasFocus()
    ) {
        return;
    }

    state.secondsToday += 1;

    if (state.secondsToday >= 120 && state.lastCompletedDate !== today) {
        state.count =
            state.lastCompletedDate === getYesterdayKey()
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