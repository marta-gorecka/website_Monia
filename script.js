// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Portfolio Filter
const filterButtons = document.querySelectorAll('.filter-btn');
const projects = document.querySelectorAll('.project-card');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // --- NEW: Handle Active Class Toggle ---
        document.querySelector('.filter-btn.active').classList.remove('active');
        button.classList.add('active');
        // ---------------------------------------

        const filter = button.dataset.filter;
        
        projects.forEach(project => {
            if (filter === 'all' || project.dataset.category === filter) {
                project.style.display = 'block';
            } else {
                project.style.display = 'none';
            }
        });
    });
});

const modal = document.getElementById("projectModal");
const closeModal = document.querySelector(".close-modal");

document.querySelectorAll('.project-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault(); // This stops the browser from just opening the image file
        
        // 1. Grab the data from your HTML attributes
        const imgPath = this.getAttribute('href');
        const title = this.getAttribute('data-title');
        const desc = this.getAttribute('data-description');

        // 2. Fill the modal elements (Only the ones that still exist!)
        if(document.getElementById('modal-img')) {
            document.getElementById('modal-img').src = imgPath;
        }
        if(document.getElementById('modal-title')) {
            document.getElementById('modal-title').innerText = title;
        }
        if(document.getElementById('modal-description')) {
            const descEl = document.getElementById('modal-description');
            descEl.innerText = desc;

            // Optional: turn a website mentioned in the description into a link
            const link = this.getAttribute('data-link');
            const linkText = this.getAttribute('data-link-text');
            if (link && linkText && desc.includes(linkText)) {
                const [before, ...after] = desc.split(linkText);
                const a = document.createElement('a');
                a.href = link;
                a.target = '_blank';
                a.rel = 'noopener';
                a.textContent = linkText;
                descEl.replaceChildren(before, a, after.join(linkText));
            }
        }

        // 3. Show the modal
        modal.style.display = "block";
    });
});

// Close logic
closeModal.onclick = () => modal.style.display = "none";
window.onclick = (event) => {
    if (event.target == modal) modal.style.display = "none";
};

// Lazy Loading Images
const images = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
        }
    });
});

images.forEach(img => imageObserver.observe(img));

const timelineItems = document.querySelectorAll('.timeline-item');

const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.2 });

timelineItems.forEach(item => {
    // Set initial hidden state
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = 'all 0.6s ease-out';
    timelineObserver.observe(item);
});
