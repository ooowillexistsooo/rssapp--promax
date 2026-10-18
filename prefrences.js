const savedFont = localStorage.getItem('globalSiteFont');

if (savedFont) {
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
        })
    }
})