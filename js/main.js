// Sidebar toggle for mobile
const sidebarToggle = document.querySelector('.sidebar-toggle');
const sidebar = document.querySelector('.sidebar');

sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open'); // Use a CSS class to handle the open/close state
});

// Smooth scrolling for navigation using event delegation
document.querySelector('.sidebar-nav').addEventListener('click', (e) => {
    const target = e.target.closest('a'); // Find the closest anchor tag
    if (target) {
        e.preventDefault();
        const sectionId = target.getAttribute('href').substring(1); // Get the section ID
        document.getElementById(sectionId).scrollIntoView({
            behavior: 'smooth'
        });

        // Close sidebar on mobile after selection
        if (window.innerWidth <= 1024) {
            sidebar.classList.remove('open'); // Close the sidebar by removing the 'open' class
        }
    }
});

// No need for JavaScript hover effects; handled in CSS