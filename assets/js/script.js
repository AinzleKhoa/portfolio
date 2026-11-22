/*---------------------------------------
  Initialize the hero background image with overlay
-----------------------------------------*/
function initBackground(headerId) {
    const header = document.getElementById(headerId);
    if (!header) return;

    const bg = header.getAttribute('data-bg');
    if (!bg) return;

    header.style.background = `
        linear-gradient(180deg, rgba(4, 20, 48, 0.72), rgba(6, 32, 72, 0.78)),
        url('${bg}')
    `;
    header.style.backgroundSize = "cover";
    header.style.backgroundPosition = "center";
    header.style.backgroundRepeat = "no-repeat";
    header.style.backgroundAttachment = "fixed";
}

/*---------------------------------------
  Copy text from contact card
-----------------------------------------*/
function copyText(event) {
    event.stopPropagation();
    event.preventDefault();

    const copyText = document.getElementById('copy-text').innerText;
    navigator.clipboard.writeText(copyText)
        .then(() => alert("Text copied to clipboard!"))
        .catch(err => console.error("Copy failed:", err));
}

/*---------------------------------------
  Bootstrap ScrollSpy
-----------------------------------------*/
function initScrollSpy() {
    new bootstrap.ScrollSpy(document.body, {
        target: '#navbarNav',
        offset: 70
    });
}

/*---------------------------------------
  Earlier Work (small cards from projects.json)
-----------------------------------------*/
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function createEarlierCard(project) {
    const link = (url) => url && url !== 'none';
    const buttons = [];
    if (link(project.githubLink)) buttons.push(`<a class="btn-cta outline btn-sm" href="${escapeHtml(project.githubLink)}" target="_blank" rel="noopener noreferrer"><i class="fab fa-github"></i> GitHub</a>`);
    if (link(project.websiteLink)) buttons.push(`<a class="btn-cta outline btn-sm" href="${escapeHtml(project.websiteLink)}" target="_blank" rel="noopener noreferrer"><i class="fas fa-globe"></i> Website</a>`);
    if (link(project.youtube)) buttons.push(`<a class="btn-cta outline btn-sm" href="${escapeHtml(project.youtube)}" target="_blank" rel="noopener noreferrer"><i class="fab fa-youtube"></i> Demo video</a>`);

    const chips = (project.chips || []).map(c => `<span class="earlier-chip">${escapeHtml(c)}</span>`).join('');

    return `
    <article class="earlier-card">
        <div class="earlier-thumb">
            <img src="${escapeHtml(project.thumb)}" alt="${escapeHtml(project.title)} screenshot" loading="lazy">
        </div>
        <div class="earlier-body">
            <p class="earlier-year">${escapeHtml(project.yearCompleted)}</p>
            <h3 class="earlier-title">${escapeHtml(project.title)}</h3>
            <p class="earlier-meta">${escapeHtml(project.meta)}</p>
            <p class="earlier-summary">${escapeHtml(project.summary)}</p>
            <div class="earlier-chips">${chips}</div>
            <div class="earlier-links">${buttons.join('')}</div>
        </div>
    </article>`;
}

async function renderEarlierWork() {
    const list = document.getElementById('earlier-list');
    if (!list) return;

    try {
        const response = await fetch('./assets/data/projects.json');
        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error('Project data is not an array.');
            return;
        }

        list.innerHTML = data.map(createEarlierCard).join('');
    } catch (error) {
        console.error('Error fetching JSON data:', error);
    }
}

/*---------------------------------------
  Main initializer
-----------------------------------------*/
function initPage() {
    // ?noaos: static capture mode (screenshots). Real visitors never pass this.
    if (new URLSearchParams(window.location.search).has('noaos')) {
        document.querySelectorAll('[data-aos]').forEach(el => el.removeAttribute('data-aos'));
        document.documentElement.classList.add('capture'); // full-page captures: no 100vh hero
    } else {
        AOS.init();
    }
    initBackground('main-background');
    initScrollSpy();
    renderEarlierWork();
}

window.onload = initPage;
