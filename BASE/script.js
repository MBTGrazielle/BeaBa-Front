const navbarToggle = document.querySelector('.navbar-toggler');
const navbarCollapse = document.querySelector('.navbar-collapse');

navbarToggle.addEventListener('click', () => {
    if (window.innerWidth <= 850) {
        navbarCollapse.classList.remove('show');
    }
});

window.addEventListener('resize', () => {
    if (window.innerWidth <= 850) {
        navbarCollapse.classList.remove('show');
    }
});

if (window.innerWidth <= 850) {
    navbarCollapse.classList.remove('show');
}