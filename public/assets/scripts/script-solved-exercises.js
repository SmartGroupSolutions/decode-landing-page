
document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;
    const maxPages = 4;
    const itemsPerPage = 7;
    const menuBtn = document.getElementById('menu-toggle');
    const dropdown = document.getElementById('dropdown-menu');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const numberBtns = document.querySelectorAll('.number-btn');
    const problemCards = document.querySelectorAll('.problem-card');

    function updateUI() {
        numberBtns.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.number-btn[data-page="${currentPage}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        problemCards.forEach((card, index) => {
            const problemNumber = ((currentPage - 1) * itemsPerPage) + (index + 1);
            card.innerText = `Problema n° ${problemNumber}`;
            card.style.opacity = '0.5';
            setTimeout(() => card.style.opacity = '1', 150);
        });
    }
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateUI();
        }
    });
    nextBtn.addEventListener('click', () => {
        if (currentPage < maxPages) {
            currentPage++;
            updateUI();
        }
    });
    numberBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const pageNum = parseInt(this.getAttribute('data-page'));
            currentPage = pageNum;
            updateUI();
        });
    });
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !menuBtn.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
    updateUI();
});