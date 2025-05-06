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
    header.style.backgroundPosition = `center`;
    header.style.backgroundRepeat = "no-repeat";
    header.style.backgroundAttachment = "fixed";
}

const scrollSpy = new bootstrap.ScrollSpy(document.body, {
    target: '#navbarNav',
    offset: 70 // match your navbar height
});

function scrollToTop(e) {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function copyText(event) {
    event.stopPropagation();  // Prevents bubbling to anchor tag
    event.preventDefault();   // Prevents default <a> behavior if nested

    const copyText = document.getElementById('copy-text').innerText;
    navigator.clipboard.writeText(copyText).then(() => {
        alert("Text copied to clipboard!");
    }).catch(err => {
        console.error("Copy failed:", err);
    });
}

window.onload = function () {
    AOS.init(); // For AOS (Animate on Scroll) JS
    initBackground('main-background');
}