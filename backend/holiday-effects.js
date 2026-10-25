(() => {
    const settingKey = "holidayEffectsEnabled";
    const toggle = document.getElementById("holiday-effects-toggle");

    if (toggle) {
        toggle.checked = localStorage.getItem(settingKey) === "true";

        toggle.addEventListener("change", () => {
            localStorage.setItem(settingKey, String(toggle.checked));
            applyHolidayEffects();
        });
    }

    function getActiveHoliday() {
        const now = new Date();

        if (now.getMonth() === 9) {
            return "halloween";
        }

        return null;
    }

    function applyHolidayEffects() {
        const optedIn = localStorage.getItem(settingKey) === "true";
        const holiday = optedIn ? getActiveHoliday() : null;
        const isHalloween = holiday === "halloween";

        document.documentElement.classList.toggle(
            "holiday-halloween",
            isHalloween
        );
    }

    applyHolidayEffects();
})();