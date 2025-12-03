document.addEventListener('DOMContentLoaded', () => {
    const codeEditor = document.getElementById('main-code-editor');
    const compileButton = document.querySelector('.btn--compile');
    const chatInput = document.querySelector('.chat-column__input input');
    const sendButton = document.querySelector('.btn--send');
    const chatContent = document.querySelector('.chat-column__content');
    const copyButton = document.getElementById('btn-copy');
    const resetButton = document.getElementById('btn-reset');

    const terminalOutput = document.querySelector('.terminal__output');
    const statusFooter = document.querySelector('.editor__footer-item--status');

    const mainLayout = document.getElementById('main-layout');
    const bottomNavButtons = document.querySelectorAll('.bottom-nav .nav-item');

    const xpModal = document.getElementById('xp-modal');
    const xpModalHomeBtn = document.getElementById('xp-modal-home');

    // =========================================================
    // CÓDIGO BASE CON BUG (RETO MAX_LISTA)
    // =========================================================
    const BUGGY_CODE = `def max_lista(numeros):
    # BUG: Si la lista solo tiene negativos, 0 siempre será el 'mayor'.
    mayor = numeros[0] 
    for n in numeros:
        if n > mayor:
            mayor = n
    return mayor`;

    // --- Respuesta del tutor ---
    const KEYWORD_RESPONSE =
        'Para buscar el valor máximo, la variable inicial (<code class="code-inline">mayor</code>) debe ser un valor ' +
        'que definitivamente será superado por algún elemento de la lista. ' +
        'La solución estándar es inicializar <code class="code-inline">mayor</code> con el **primer elemento** de la lista (<code class="code-inline">numeros[0]</code>).';

    const DEFAULT_RESPONSE = 'No he entendido tu consulta, escríbela de nuevo.';
    const KEYWORDS = ['ayuda', 'pista', 'bug', 'mayor'];

    // =========================================================
    // UTILIDADES
    // =========================================================
    const showTerminalMessage = (message, statusText, isError = false) => {
        const color = isError ? '#ff5555' : 'var(--color-accent)';

        if (terminalOutput) {
            terminalOutput.innerHTML = `<span style="color: ${color};">${message}</span>`;
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
        if (statusFooter) {
            statusFooter.textContent = statusText;
            statusFooter.style.color = color;
        }
    };

    const openXpModal = () => {
        if (xpModal) {
            xpModal.classList.add('xp-modal--visible');
        }
    };

    // =========================================================
    // VALIDACIÓN DEL RETO (MÁS ESTRICTA)
    // =========================================================
    const validateSolution = (code) => {
        const cleaned = code.replace(/\s+/g, ' ');

        // 1. Debe haber una definición de la función 'max_lista'
        const hasFunction = /def\s*max_lista\(numeros\):/.test(cleaned);

        // 2. La línea de inicialización DEBE ser: mayor = numeros[0]
        // Se buscan las expresiones mayor=numeros[0] o mayor=n[0] (si cambiaron el nombre del parámetro)
        const isIndexFixed = /mayor\s*=\s*numeros\[0\]/.test(cleaned) ||
            /mayor\s*=\s*n\[0\]/.test(cleaned);

        // 3. Se permite también la inicialización con un valor muy pequeño (ej: -9999 o float('-inf'))
        const isNegativeFixed = /mayor\s*=\s*(-?\d+)|mayor\s*=\s*float\(\s*'-\s*inf'\s*\)/.test(cleaned);

        // Reto correcto si: (Se encuentra la función AND está corregida con [0]) O (Se encuentra la función AND está corregida con un valor negativo muy bajo)
        return hasFunction && (isIndexFixed || isNegativeFixed);
    };

    // =========================================================
    // RESTO DE FUNCIONES (NAVEGACIÓN, CHAT, BOTONES) - Se mantienen igual
    // =========================================================
    bottomNavButtons.forEach(button => {
        button.addEventListener('click', () => {
            const view = button.getAttribute('data-view');

            bottomNavButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            mainLayout.className = 'main-layout';
            mainLayout.classList.add(`active-${view}-view`);

            const dropdownMenu = document.getElementById('dropdown-menu');
            if (dropdownMenu && dropdownMenu.classList.contains('show')) {
                dropdownMenu.classList.remove('show');
            }
        });
    });

    const menuToggle = document.getElementById('menu-toggle');
    const dropdownMenu = document.getElementById('dropdown-menu');
    if (menuToggle && dropdownMenu) {
        menuToggle.addEventListener('click', () => {
            dropdownMenu.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!dropdownMenu.contains(e.target) &&
                !menuToggle.contains(e.target) &&
                dropdownMenu.classList.contains('show')) {
                dropdownMenu.classList.remove('show');
            }
        });
    }

    const addMessageToChat = (text, isTutor = true) => {
        const messageClass = isTutor ? 'chat-message--tutor' : 'chat-message--user';
        const textClass = isTutor ? '' : 'chat-message__text--user';
        const time = new Date().toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const newMessage = document.createElement('div');
        newMessage.classList.add('chat-message', messageClass);
        newMessage.innerHTML = `
            <p class="chat-message__time">${time}</p>
            <p class="chat-message__text ${textClass}">${text}</p>
        `;
        chatContent.appendChild(newMessage);
        chatContent.scrollTop = chatContent.scrollHeight;
    };

    const sendUserMessage = () => {
        const message = chatInput.value.trim();
        if (message === '') return;

        addMessageToChat(message, false); // Usuario
        chatInput.value = '';

        let tutorResponse = DEFAULT_RESPONSE;
        const normalized = message.toLowerCase();

        for (const keyword of KEYWORDS) {
            if (normalized.includes(keyword)) {
                tutorResponse = KEYWORD_RESPONSE;
                break;
            }
        }

        setTimeout(() => {
            addMessageToChat(tutorResponse, true);
        }, 800);
    };

    if (sendButton) {
        sendButton.addEventListener('click', sendUserMessage);
    }
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendUserMessage();
            }
        });
    }

    if (compileButton && codeEditor) {
        compileButton.addEventListener('click', () => {
            const currentCode = codeEditor.value;

            if (currentCode.trim() === '') {
                showTerminalMessage(
                    'El editor está vacío. Escribe o corrige el código antes de verificar.',
                    'Reto pendiente ⚠️',
                    true
                );
                return;
            }

            terminalOutput.innerHTML =
                `<span style="color: #999999;">Verificando solución...</span>`;
            if (statusFooter) {
                statusFooter.textContent = 'Verificando...';
                statusFooter.style.color = '#999999';
            }

            setTimeout(() => {
                const ok = validateSolution(currentCode);

                if (ok) {
                    showTerminalMessage(
                        '¡Felicidades! Has corregido correctamente la inicialización de la función max_lista.',
                        'Examen Final Completado ✔️',
                        false
                    );
                    openXpModal();
                } else {
                    showTerminalMessage(
                        'La inicialización de la variable "mayor" sigue siendo incorrecta. La solución más robusta es usar numeros[0] o un valor muy pequeño.',
                        'Sigue intentando 💡',
                        true
                    );
                }
            }, 600);
        });
    }

    if (copyButton && codeEditor) {
        copyButton.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(codeEditor.value);
                showTerminalMessage('Código copiado al portapapeles.', 'Copiado ✔️', false);
            } catch (e) {
                showTerminalMessage('No se pudo copiar el código.', 'Error de copiado ❌', true);
            }
        });
    }

    if (resetButton && codeEditor) {
        resetButton.addEventListener('click', () => {
            codeEditor.value = BUGGY_CODE;
            showTerminalMessage(
                'Código reiniciado al estado original del reto.',
                'Listo para intentar de nuevo',
                false
            );
        });
    }

    if (xpModalHomeBtn) {
        xpModalHomeBtn.addEventListener('click', () => {
            window.location.href = 'home.html';
        });
    }

    if (codeEditor) {
        codeEditor.value = BUGGY_CODE;
    }

    showTerminalMessage(
        'El sistema de búsqueda del valor máximo está fallando. Revisa la inicialización de la variable "mayor".',
        'Examen pendiente ⚙️',
        false
    );
});