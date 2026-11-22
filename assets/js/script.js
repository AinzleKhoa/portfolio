/*---------------------------------------
  Initialize the hero background image with overlay
-----------------------------------------*/
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
    const link = project.websiteLink !== 'none' ? project.websiteLink : project.githubLink;
    const image = project.image !== 'none'
        ? `<img data-src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)}" class="lazyload earlier-thumb">`
        : '';
    const inner = `
            <div class="earlier-media">${image}</div>
            <div class="earlier-info">
                <h4 class="earlier-title">${escapeHtml(project.title)}</h4>
                <p class="earlier-meta">${escapeHtml(project.yearCompleted)}</p>
            </div>`;

    if (link === 'none') {
        return `<div class="earlier-item"><div class="earlier-card">${inner}</div></div>`;
    }
    return `<div class="earlier-item">
        <a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer" class="earlier-card">${inner}
        </a>
    </div>`;
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
    AOS.init();
    initBackground('main-background');
    initScrollSpy();
    renderEarlierWork();
}

window.onload = initPage;
