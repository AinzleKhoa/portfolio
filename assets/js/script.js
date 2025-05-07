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
 Scroll to top when clicking certain links
-----------------------------------------*/
function scrollToTop(e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
 Setup Bootstrap ScrollSpy
-----------------------------------------*/
function initScrollSpy() {
    new bootstrap.ScrollSpy(document.body, {
        target: '#navbarNav',
        offset: 70
    });
}

/*---------------------------------------
 Preloader with minimum time logic
-----------------------------------------*/
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

/*---------------------------------------
// Init projects
-----------------------------------------*/
let category = '';
let isFeatured = true; // True at start

let currentPage = 1; // Start with the first page
let itemsPerPage = 2; // Number of items to show per page

async function initGeneratingProjects() {
    currentPage = 1; // Restart at the first page
    generateProjects();
}

async function generateProjects() {
    try {
        const response = await fetch('./assets/data/projects.json');
        const data = await response.json();

        if (!Array.isArray(data)) { // Handle Array errors
            console.error('Project data is not an array.');
            return;
        }

        countTotalProjectDone(data.length); // Update the total project

        currentCategory = category.toLowerCase();
        let filteredProjects = [];

        if (isFeatured === true) { // If featured is selected
            filteredProjects = data.filter(data => data.featured === 'true');
            renderProjectsByPage(filteredProjects);
            return;
        }

        switch (currentCategory) { // If a different category is selected
            case 'all':
                filteredProjects = data;
                renderProjectsByPage(filteredProjects);
                return;

            default:
                filteredProjects = data.filter(d => {
                    const category = d.category.split(',').map(t => t.trim().toLowerCase());

                    return category.includes(currentCategory);
                });
                renderProjectsByPage(filteredProjects);
                return;
        }
    } catch (error) {
        console.error('Error fetching JSON data:', error);
    }
}

function renderProjectsByPage(project) {
    let output = "";

    const totalPages = Math.ceil(project.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    pagedProjects = project.slice(startIndex, endIndex);

    pagedProjects.forEach(p => {
        output += createProjectCard(p);
    });

    generatePagination(totalPages, generateProjects);

    document.getElementById("project-list").innerHTML = output;
}

function generatePagination(totalPages, updateFunction) {
    const pagination = document.getElementById('pagination');
    let paginationHTML = '';

    // Clear the previous pagination HTML
    pagination.innerHTML = '';

    // First page Button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}" id="firstPage">
            <a class="page-link" href="#" aria-label="First Page">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;

    // Previous Button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}" id="prevPage">
            <a class="page-link" href="#" aria-label="Previous">
                <span aria-hidden="true">&lsaquo;</span>
            </a>
        </li>
    `;

    // Page Number Buttons
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link page-link-number" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }

    // Next Button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}" id="nextPage">
            <a class="page-link" href="#" aria-label="Next">
                <span aria-hidden="true">&rsaquo;</span>
            </a>
        </li>
    `;

    // Last page Button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}" id="lastPage">
            <a class="page-link" href="#" aria-label="Last Page">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;

    // Insert the updated pagination HTML into the container
    pagination.innerHTML = paginationHTML;

    // Set event listeners for page numbers
    document.querySelectorAll('.page-link-number').forEach(pageLink => {
        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            const newPage = parseInt(pageLink.dataset.page);
            if (newPage !== currentPage) {
                currentPage = newPage;
                updateFunction(); // use callback
            }
        });
    });

    // Set event listener for First page button
    document.getElementById('firstPage').addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage !== 1) {
            currentPage = 1;
            updateFunction(); // use callback
        }
    });

    // Set event listener for Previous button
    document.getElementById('prevPage').addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            updateFunction(); // use callback
        }
    });

    // Set event listener for Next button
    document.getElementById('nextPage').addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            updateFunction(); // use callback
        }
    });

    // Set event listener for Last page button
    document.getElementById('lastPage').addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage !== totalPages) {
            currentPage = totalPages;
            updateFunction(); // use callback
        }
    });
}

function createProjectCard(project) {
    return `
        <div class="col-lg-6 col-md-6 col-12 mb-4 d-flex">
        <div class="project-card card h-100 w-100 d-flex flex-column">
            <img src="${project.image}" alt="${project.title}"
                class="img-fluid project-thumbnail">
            <div class="project-info flex-grow-1">
                <h5 class="project-title">${project.title}</h5>
                <p class="project-tech">${project.tech}</p>
            </div>
        </div>
    </div>
    `;
}
/*---------------------------------------
// Total Project Done
-----------------------------------------*/
function countTotalProjectDone(total) {
    const counter = document.getElementById('total-project');
    if (counter) {
        counter.textContent = total;
    }
}
/*---------------------------------------
// Category Project Button
-----------------------------------------*/
function initCategoryBtn() {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            reinitProjects(btn);
        });
    });
}

function reinitProjects(btn) {
    category = btn.dataset.category;
    if (category === 'featured') {
        isFeatured = true;
    } else {
        isFeatured = false;
    }
    initGeneratingProjects();
}
/*---------------------------------------
// Main initializer function
-----------------------------------------*/
function initPage() {
    AOS.init();
    initBackground('main-background');
    initScrollSpy();
    hidePreloader(1000);
    initCategoryBtn();
    initGeneratingProjects();
}

// Track initial page load time
window._pageStart = Date.now();

// Wait until full page load
window.onload = initPage;
