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

        let decoration = document.getElementById("holiday-decoration");

        if (isHalloween && !decoration) {
            decoration = document.createElement("span");
            decoration.id = "holiday-decoration";
            decoration.setAttribute("aria-hidden", "true");
            decoration.textContent = "🎃";
            document.body.append(decoration);
        } else if (!isHalloween) {
            decoration?.remove();
        }
    }

    applyHolidayEffects();
})();