document.addEventListener('DOMContentLoaded', () => {

    const menuBtn = document.getElementById('menu-toggle');
    const dropdown = document.getElementById('dropdown-menu');

    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !menuBtn.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });

    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    const btnEnviar = document.getElementById('btn-enviar');
    const btnCompilar = document.getElementById('btn-compilar');

    const modalSuccess = document.getElementById('modal-success');
    const modalError = document.getElementById('modal-error');

    const closeSuccess = document.getElementById('close-success');
    const closeError = document.getElementById('close-error');

    btnEnviar.addEventListener('click', () => {
        modalSuccess.classList.add('show-modal');
    });

    btnCompilar.addEventListener('click', () => {
        modalError.classList.add('show-modal');
    });
    closeSuccess.addEventListener('click', () => {
        modalSuccess.classList.remove('show-modal');
    });
    closeError.addEventListener('click', () => {
        modalError.classList.remove('show-modal');
    });
});