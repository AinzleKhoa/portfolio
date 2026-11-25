// Bump on every content change so browsers fetch fresh text instead of a cached copy
const CONTENT_VERSION = '20261125d';

/*---------------------------------------
  Language (EN / VI): dictionaries in assets/i18n, choice remembered
-----------------------------------------*/
const LANG_STORAGE_KEY = 'site-lang';
const I18N = { current: 'en', dict: {}, cache: {} };
let earlierProjects = null; // parsed projects.json, kept for re-rendering on language change

function t(key) {
    const value = I18N.dict[key];
    return value === undefined ? key : value;
}

function readStoredLang() {
    try {
        const v = window.localStorage.getItem(LANG_STORAGE_KEY);
        return v === 'en' || v === 'vi' ? v : null;
    } catch (e) {
        return null; // storage blocked (private window, cleared site data)
    }
}

function writeStoredLang(lang) {
    try {
        window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch (e) {
        /* ignore: the choice still applies for this page view */
    }
}

function detectLang() {
    // ?lang=en|vi overrides for testing; not persisted
    const param = new URLSearchParams(window.location.search).get('lang');
    if (param === 'en' || param === 'vi') return param;
    const stored = readStoredLang();
    if (stored) return stored;
    return (navigator.language || '').toLowerCase().startsWith('vi') ? 'vi' : 'en';
}

async function loadDict(lang) {
    if (I18N.cache[lang]) return I18N.cache[lang];
    try {
        const response = await fetch(`./assets/i18n/${lang}.json?v=${CONTENT_VERSION}`, { cache: 'no-cache' });
        if (!response.ok) throw new Error(response.status);
        I18N.cache[lang] = await response.json();
    } catch (error) {
        console.error(`Could not load ${lang} strings:`, error);
        I18N.cache[lang] = null;
    }
    return I18N.cache[lang];
}

// Attribute values may contain entities such as &amp; (lightbox titles); decode them for setAttribute.
function decodeEntities(text) {
    const area = document.createElement('textarea');
    area.innerHTML = text;
    return area.value;
}

function applyStaticStrings(dict) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const value = dict[el.getAttribute('data-i18n')];
        if (value !== undefined) el.innerHTML = value;
    });
    // data-i18n-attr="alt:key;data-title:key" sets attributes (alt, aria-label, meta content, lightbox title)
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
        el.getAttribute('data-i18n-attr').split(';').forEach(pair => {
            const [attr, key] = pair.split(':').map(s => s.trim());
            if (attr && key && dict[key] !== undefined) el.setAttribute(attr, decodeEntities(dict[key]));
        });
    });
}

function updateLanguageUi(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => {
        const active = btn.getAttribute('data-lang') === lang;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
}

async function setLanguage(lang) {
    const dict = await loadDict(lang);
    if (!dict) return; // keep the current language if the file cannot load
    I18N.current = lang;
    I18N.dict = dict;
    applyStaticStrings(dict);
    updateLanguageUi(lang);
    renderEarlierWork();
}

function initLanguageSwitch() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            writeStoredLang(lang);
            setLanguage(lang);
        });
    });
}

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
        .then(() => alert(t('alert.copied')))
        .catch(err => console.error("Copy failed:", err));
}

/*---------------------------------------
  Nav highlight from scroll position (replaces Bootstrap ScrollSpy)
-----------------------------------------*/
function initScrollSpy() {
    const links = [...document.querySelectorAll('#navbarNav .nav-link[href^="#"]')];
    const sections = links
        .map(a => document.getElementById(a.getAttribute('href').slice(1)))
        .filter(Boolean);
    if (!sections.length) return;

    function update() {
        const atBottom = window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
        let current = sections[0];
        if (atBottom) {
            current = sections[sections.length - 1]; // last section wins at the bottom of the page
        } else {
            const line = window.scrollY + 120; // just below the floating navbar
            sections.forEach(sec => {
                if (sec.getBoundingClientRect().top + window.scrollY <= line) current = sec;
            });
        }
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current.id));
    }
    window.addEventListener('scroll', update, { passive: true }); // cheap: only 7 section offsets
    window.addEventListener('resize', update);
    update();
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

// Vietnamese fields are optional in projects.json (title_vi, meta_vi, ...); English is the fallback.
function localField(project, field) {
    if (I18N.current === 'vi' && project[field + '_vi']) return project[field + '_vi'];
    return project[field];
}

function createEarlierCard(project) {
    const link = (url) => url && url !== 'none';
    const buttons = [];
    if (link(project.githubLink)) buttons.push(`<a class="btn-cta outline btn-sm" href="${escapeHtml(project.githubLink)}" target="_blank" rel="noopener noreferrer"><i class="fab fa-github"></i> ${escapeHtml(t('earlier.github'))}</a>`);
    if (link(project.websiteLink)) buttons.push(`<a class="btn-cta outline btn-sm" href="${escapeHtml(project.websiteLink)}" target="_blank" rel="noopener noreferrer"><i class="fas fa-globe"></i> ${escapeHtml(t('earlier.website'))}</a>`);
    if (link(project.youtube)) buttons.push(`<a class="btn-cta outline btn-sm" href="${escapeHtml(project.youtube)}" target="_blank" rel="noopener noreferrer"><i class="fab fa-youtube"></i> ${escapeHtml(t('earlier.demo'))}</a>`);

    const chips = (project.chips || []).map(c => `<span class="earlier-chip">${escapeHtml(c)}</span>`).join('');
    const title = localField(project, 'title');

    return `
    <article class="earlier-card">
        <div class="earlier-thumb">
            <img src="${escapeHtml(project.thumb)}" alt="${escapeHtml(title)} - ${escapeHtml(t('earlier.shot'))}" loading="lazy">
        </div>
        <div class="earlier-body">
            <p class="earlier-year">${escapeHtml(localField(project, 'yearCompleted')) || '&nbsp;'}</p>
            <h3 class="earlier-title">${escapeHtml(title)}</h3>
            <p class="earlier-meta">${escapeHtml(localField(project, 'meta'))}</p>
            <p class="earlier-summary">${escapeHtml(localField(project, 'summary'))}</p>
            <div class="earlier-chips">${chips}</div>
            <div class="earlier-links">${buttons.join('')}</div>
        </div>
    </article>`;
}

async function renderEarlierWork() {
    const list = document.getElementById('earlier-list');
    if (!list) return;

    try {
        if (!earlierProjects) {
            const response = await fetch(`./assets/data/projects.json?v=${CONTENT_VERSION}`, { cache: 'no-cache' });
            const data = await response.json();

            if (!Array.isArray(data)) {
                console.error('Project data is not an array.');
                return;
            }
            earlierProjects = data;
        }

        list.innerHTML = earlierProjects.map(createEarlierCard).join('');
    } catch (error) {
        console.error('Error fetching JSON data:', error);
    }
}

/*---------------------------------------
  Main initializer
-----------------------------------------*/
async function initPage() {
    // ?noaos: static capture mode (screenshots). Real visitors never pass this.
    if (new URLSearchParams(window.location.search).has('noaos')) {
        document.querySelectorAll('[data-aos]').forEach(el => el.removeAttribute('data-aos'));
        document.documentElement.classList.add('capture'); // full-page captures: no 100vh hero
    } else {
        AOS.init();
    }
    initBackground('main-background');
    initScrollSpy();
    initLanguageSwitch();
    initCvMenu();
    await setLanguage(detectLang());

    // Test-only flags for screenshots: ?menu=open opens the mobile menu, ?cvmenu=open the desktop CV dropdown
    const params = new URLSearchParams(window.location.search);
    if (params.get('menu') === 'open') {
        bootstrap.Collapse.getOrCreateInstance(document.getElementById('navbarNav'), { toggle: false }).show();
    }
    if (params.get('cvmenu') === 'open') {
        setCvMenuOpen(true);
    }
}

/*---------------------------------------
  CV menu: desktop dropdown (mobile shows the buttons directly via CSS)
-----------------------------------------*/
function setCvMenuOpen(open, focusToggle) {
    const menu = document.getElementById('cv-menu');
    const toggle = document.getElementById('cv-toggle');
    if (!menu || !toggle) return;
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (focusToggle) toggle.focus();
}

function initCvMenu() {
    const menu = document.getElementById('cv-menu');
    const toggle = document.getElementById('cv-toggle');
    if (!menu || !toggle) return;

    toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        setCvMenuOpen(!menu.classList.contains('open'));
    });
    document.addEventListener('click', (event) => {
        if (!menu.contains(event.target)) setCvMenuOpen(false);
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menu.classList.contains('open')) setCvMenuOpen(false, true);
    });
    // Tabbing out of the dropdown closes it
    menu.addEventListener('focusout', (event) => {
        if (!menu.contains(event.relatedTarget)) setCvMenuOpen(false);
    });
    menu.querySelectorAll('.cv-item').forEach(link => {
        link.addEventListener('click', () => setCvMenuOpen(false));
    });
}

// DOMContentLoaded, not onload: the language switch must not wait for slow external CDN files.
document.addEventListener('DOMContentLoaded', initPage);
