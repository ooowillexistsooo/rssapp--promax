const savedFont = localStorage.getItem('globalSiteFont');
const themeToggleBtn = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme');

document.documentElement.classList.toggle('dark-mode', savedTheme === 'dark');

if (savedFont && document.body) {
    document.body.style.fontFamily = savedFont;
}

document.addEventListener('DOMContentLoaded', () => {
    const fontDropdown = document.getElementById('fontDropdown');

    if(fontDropdown) {
        if (savedFont) {
            fontDropdown.value = savedFont;
        }
        fontDropdown.addEventListener('change', function() {
            const selectedFont = this.value;

            document.body.style.fontFamily = selectedFont;
            localStorage.setItem('globalSiteFont', selectedFont);
        });
    }
});

if (themeToggleBtn) {
    const updateThemeToggle = () => {
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        const label = isDarkMode ? 'Switch to light mode' : 'Switch to dark mode';
        themeToggleBtn.setAttribute('aria-label', label);
        themeToggleBtn.setAttribute('title', label);
        themeToggleBtn.setAttribute('aria-pressed', String(isDarkMode));
    };

    updateThemeToggle();
    themeToggleBtn.addEventListener('click', () => {
        const isDarkMode = document.documentElement.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        updateThemeToggle();
    });
}