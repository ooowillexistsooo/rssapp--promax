import { auth, db } from "./firebase-config.js";
import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

(() => {
    const storageKey = "fregStreak";
    const button = document.getElementById("freg-streak-toggle");
    const statusText = document.getElementById("freg-streak-status");
    const goalSeconds = 120;
    const stateDocumentPath = "users";

    function dateKey(date = new Date()) {
        return date.toISOString().slice(0, 10);
    }

    function getYesterdayKey(date = new Date()) {
        const yesterday = new Date(date);
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        return dateKey(yesterday);
    }

    function createEmptyState() {
        return {
            count: 0,
            lastCompletedDate: null,
            trackedDate: dateKey(),
            secondsToday: 0
        };
    }

    function isValidDateKey(value) {
        return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
    }

    function isValidState(value) {
        return value !== null &&
            typeof value === "object" &&
            Number.isInteger(value.count) &&
            value.count >= 0 &&
            (value.lastCompletedDate === null || isValidDateKey(value.lastCompletedDate)) &&
            isValidDateKey(value.trackedDate) &&
            Number.isInteger(value.secondsToday) &&
            value.secondsToday >= 0;
    }

    function loadLocalState() {
        try {
            const savedState = JSON.parse(localStorage.getItem(storageKey) || "null");
            return isValidState(savedState) ? savedState : createEmptyState();
        } catch (error) {
            console.error("Could not read local streak:", error);
            return createEmptyState();
        }
    }

    let state = loadLocalState();
    let currentUser = null;
    let streakReady = false;
    let isTracking = false;
    let statusError = "";
    let firestoreSaveQueue = Promise.resolve();
    let authGeneration = 0;

    function stateDocument(user) {
        return doc(db, stateDocumentPath, user.uid);
    }

    async function loadAccountState(user) {
        const userDocument = stateDocument(user);
        const snapshot = await getDoc(userDocument);
        const accountState = snapshot.data()?.streak;

        if (accountState !== undefined) {
            if (!isValidState(accountState)) {
                throw new Error("Saved account streak has an invalid format.");
            }
            return accountState;
        }

        const migratedState = loadLocalState();
        await setDoc(userDocument, { streak: migratedState }, { merge: true });
        return migratedState;
    }

    function persistLocalState() {
        try {
            localStorage.setItem(storageKey, JSON.stringify(state));
            return true;
        } catch (error) {
            console.error("Could not save local streak:", error);
            statusError = " Could not save streak on this device.";
            return false;
        }
    }

    function syncAccountState(user = currentUser) {
        if (!user) return Promise.resolve();

        const stateSnapshot = { ...state };
        const save = firestoreSaveQueue
            .catch(() => {})
            .then(() => setDoc(
                stateDocument(user),
                { streak: stateSnapshot },
                { merge: true }
            ));

        firestoreSaveQueue = save;
        return save;
    }

    function updateTrackedDay() {
        const today = dateKey();
        if (state.trackedDate === today) return false;

        state.trackedDate = today;
        state.secondsToday = 0;
        persistLocalState();
        return true;
    }

    function render() {
        const today = dateKey();
        const streakIsActive =
            state.lastCompletedDate === today ||
            state.lastCompletedDate === getYesterdayKey();
        const displayedCount = streakIsActive ? state.count : 0;
        const displayedSeconds = Math.min(state.secondsToday, goalSeconds);
        const minutes = Math.floor(displayedSeconds / 60);
        const seconds = displayedSeconds % 60;
        const goalText =
            `${Math.floor(goalSeconds / 60)}:${String(goalSeconds % 60).padStart(2, "0")}`;

        statusText.textContent =
            `Streak: ${displayedCount} day(s)! Today: ${minutes}:${String(seconds).padStart(2, "0")} / ${goalText}.${statusError}`;
        button.textContent = isTracking ? "pause reading" : "start reading";
        button.disabled = !streakReady;
    }

    async function persistProgress(syncNow = false) {
        const localSaved = persistLocalState();
        if (!localSaved || !currentUser || !syncNow) return;

        try {
            await syncAccountState();
            statusError = "";
        } catch (error) {
            console.error("Could not sync account streak:", error);
            statusError = " Account streak sync failed; it will retry.";
        }
    }

    button.addEventListener("click", async () => {
        if (!streakReady) return;

        isTracking = !isTracking;
        render();
        if (!isTracking) await persistProgress(true);
    });

    setInterval(async () => {
        const dayChanged = updateTrackedDay();

        if (dayChanged) {
            await persistProgress(true);
            render();
        }

        if (
            !streakReady ||
            !isTracking ||
            document.visibilityState !== "visible" ||
            !document.hasFocus()
        ) {
            return;
        }

        const today = dateKey();
        if (state.lastCompletedDate === today) return;

        state.secondsToday = Math.min(state.secondsToday + 1, goalSeconds);
        let completedToday = false;

        if (state.secondsToday >= goalSeconds) {
            state.count =
                state.lastCompletedDate === getYesterdayKey()
                    ? state.count + 1
                    : 1;
            state.lastCompletedDate = today;
            completedToday = true;
        }

        persistLocalState();
        render();

        if (completedToday) await persistProgress(true);
    }, 1000);

    const syncInterval = setInterval(async () => {
        if (currentUser && streakReady) {
            await persistProgress(true);
        }
    }, 15000);

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden" && currentUser && streakReady) {
            persistProgress(true);
        }
    });

    window.addEventListener("pagehide", () => {
        if (currentUser && streakReady) {
            persistProgress(true);
        }
        clearInterval(syncInterval);
    });

    onAuthStateChanged(
        auth,
        async user => {
            const generation = ++authGeneration;
            currentUser = user;
            streakReady = false;
            isTracking = false;
            statusError = "";
            render();

            try {
                const loadedState = user ? await loadAccountState(user) : loadLocalState();
                if (generation !== authGeneration) return;

                state = loadedState;
                updateTrackedDay();
                persistLocalState();
                streakReady = true;
                render();
                if (user) await persistProgress(true);
            } catch (error) {
                if (generation !== authGeneration) return;
                console.error("Could not load account streak:", error);
                statusError = " Could not load streak from your account.";
                render();
            }
        },
        error => {
            authGeneration += 1;
            streakReady = false;
            console.error("Could not check streak sign-in status:", error);
            statusError = " Could not check sign-in status for streak sync.";
            render();
        }
    );

    render();
})();
