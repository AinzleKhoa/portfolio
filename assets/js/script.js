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
let itemsPerPage = 3; // Number of items to show per page

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

    initVideoPlayerProject(); // Init video after all project is done loading
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
    <div class="col-lg-4 col-md-6 col-12 mb-4 d-flex">
        <div class="project-card card h-100 w-100 d-flex flex-column" onclick="showProjectModal('${project.title}', '${project.tech}', '${project.image}', '${project.video}', '${project.team}', '${project.role}', '${project.purpose}', '${project.description}', '${project.githubLink}', '${project.downloadLink}', '${project.websiteLink}', '${project.yearCompleted}')">
            <!-- Image Thumbnail -->
            <div class="project-image">
                <img data-src="${project.image}" alt="${project.title}" class="img-fluid project-thumbnail lazyload">
                <!-- Video Preview (hidden by default) -->
                <video class="project-video" loop muted preload="auto" playsinline>
                    <source src="${project.video}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>
            <div class="project-info flex-grow-1">
                <p class="project-top">Click to view more details</p>
                <h5 class="project-title">${project.title}</h5>
                <p class="project-des">${project.category.toUpperCase()}</p>
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
 Video Preview Project
-----------------------------------------*/
function initVideoPlayerProject() {
    document.querySelectorAll('.project-card').forEach(card => {
        const video = card.querySelector('.project-video');

        card.addEventListener('mouseenter', () => {
            video.play(); // Play the video when hovering
            video.currentTime = 0; // Ensure it starts from the beginning each time
        });

        card.addEventListener('mouseleave', () => {
            video.pause(); // Pause the video when leaving
            video.currentTime = 0; // Rewind to the start for next hover
        });
    });
}

function stopVideoPlayerProject() {
    document.querySelectorAll('.project-card').forEach(card => {
        const video = card.querySelector('.project-video');
        video.pause(); // Pause the video when leaving
        video.currentTime = 0; // Rewind to the start for next hover
    });
}
/*---------------------------------------
// Modal Project
-----------------------------------------*/
function showProjectModal(title, tech, image, videoUrl, team, role, purpose, description, githubLink, downloadLink, websiteLink, yearCompleted) {
    // Update modal content
    const modalVideoContent = document.getElementById('modalVideoContent');

    modalVideoContent.innerHTML = `
            <video
                id="my-video"
                class="video-js"
                controls
                preload="auto"
                poster="${image}"
                data-setup='{ "fluid": true }'
                >
            <source src="${videoUrl}" type="video/mp4" />
            <p class="vjs-no-js">
                To view this video please enable JavaScript, and consider upgrading to a
                web browser that
            <a href="https://videojs.com/html5-video-support/" target="_blank"
                    >supports HTML5 video</a
                >
            </p>
            </video>
    `;

    // Update other details in the modal
    document.getElementById('projectModalTitle').textContent = title; // Set project title
    document.getElementById('tech').textContent = tech;
    document.getElementById('yearCompleted').textContent = yearCompleted.toUpperCase();
    document.getElementById('team').textContent = team;
    document.getElementById('role').textContent = role;
    document.getElementById('purpose').textContent = purpose;
    document.getElementById('description').textContent = description;

    if (githubLink === 'none') {
        document.getElementById('modalGithubLink').style.display = 'none';
    } else {
        document.getElementById('modalGithubLink').style.display = 'inline-block';
        document.getElementById('modalGithubLink').href = githubLink;
    }

    if (downloadLink === 'none') {
        document.getElementById('modalDownloadLink').style.display = 'none';
    } else {
        document.getElementById('modalDownloadLink').style.display = 'inline-block';
        document.getElementById('modalDownloadLink').href = downloadLink;
    }

    if (websiteLink === 'none') {
        document.getElementById('modalWebsiteLink').style.display = 'none';
    } else {
        document.getElementById('modalWebsiteLink').style.display = 'inline-block';
        document.getElementById('modalWebsiteLink').href = websiteLink;
    }

    // Show the modal
    const myModal = new bootstrap.Modal(document.getElementById('projectModal'));
    stopVideoPlayerProject();
    myModal.show();
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

    initBackground('sideHeader');
}

// Track initial page load time
window._pageStart = Date.now();

// Wait until full page load
window.onload = initPage;
