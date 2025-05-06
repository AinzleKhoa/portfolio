// Initialize the hero background image with overlay
function initBackground(headerId) {
    const header = document.getElementById(headerId);
    if (!header) return;

    const bg = header.getAttribute('data-bg');
    if (!bg) return;

    header.style.background = `
        linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 40%, rgba(0, 0, 0, 0) 100%),
        url('${bg}')
    `;
    header.style.backgroundSize = "cover";
    header.style.backgroundPosition = "center";
    header.style.backgroundRepeat = "no-repeat";
    header.style.backgroundAttachment = "fixed";
}

// Scroll to top when clicking certain links
function scrollToTop(e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Copy text from contact card
function copyText(event) {
    event.stopPropagation();
    event.preventDefault();

    const copyText = document.getElementById('copy-text').innerText;
    navigator.clipboard.writeText(copyText)
        .then(() => alert("Text copied to clipboard!"))
        .catch(err => console.error("Copy failed:", err));
}

// Setup Bootstrap ScrollSpy
function initScrollSpy() {
    new bootstrap.ScrollSpy(document.body, {
        target: '#navbarNav',
        offset: 70
    });
}

// Preloader with minimum time logic
function hidePreloader(minTime = 1000) {
    const preloader = document.querySelector(".preloader");
    const elapsed = Date.now() - window._pageStart;
    const delay = Math.max(0, minTime - elapsed);

    setTimeout(() => {
        preloader.style.opacity = "0";
        preloader.style.pointerEvents = "none";
        setTimeout(() => {
            preloader.style.display = "none";
        }, 500); // match fade-out time
    }, delay);
}

// Main initializer function
function initPage() {
    AOS.init();
    initBackground('main-background');
    initScrollSpy();
    hidePreloader(1000);
}

// Track initial page load time
window._pageStart = Date.now();

// Wait until full page load
window.onload = initPage;
