// Sidebar toggle for mobile
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');

        sidebarToggle.addEventListener('click', () => {
            sidebar.style.transform = sidebar.style.transform === 'translateX(0%)' 
                ? 'translateX(-100%)' 
                : 'translateX(0%)';
        });

        // Smooth scrolling for navigation
        document.querySelectorAll('.sidebar-nav a').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionId = this.getAttribute('href').substring(1);
                document.getElementById(sectionId).scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Close sidebar on mobile after selection
                if (window.innerWidth <= 1024) {
                    sidebar.style.transform = 'translateX(-100%)';
                }
            });
        });

        // Skill category hover effect
        document.querySelectorAll('.skill-category').forEach(category => {
            category.addEventListener('mouseenter', (e) => {
                e.target.style.transform = 'scale(1.05)';
            });
            category.addEventListener('mouseleave', (e) => {
                e.target.style.transform = 'scale(1)';
            });
        });
