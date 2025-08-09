function showContent(contentType) {
    // Hide all content panels
    const panels = document.querySelectorAll('.content-panel');
    panels.forEach(panel => panel.style.display = 'none');
    
    // Show selected content panel
    const selectedPanel = document.getElementById(contentType + '-content');
    if (selectedPanel) {
        selectedPanel.style.display = 'block';
    }
    
    // Update active nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    event.target.classList.add('active');
    
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('show');
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('show');
}


// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('sidebar');
    const mobileToggle = document.querySelector('.mobile-toggle');
    
    if (window.innerWidth <= 768 && 
        !sidebar.contains(event.target) && 
        !mobileToggle.contains(event.target)) {
        sidebar.classList.remove('show');
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        document.getElementById('sidebar').classList.remove('show');
    }
});