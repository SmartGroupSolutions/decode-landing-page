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

    // Código base con bug (lo ve el estudiante)
    const BUGGY_CODE = `def suma_lista(numeros):
    total = 0
    for n in numeros:
        total = total + 1  # BUG: la suma no es correcta
    return total

valores = [1, 2, 3]
print("La suma es:", suma_lista(valores))`;

    // --- Respuesta del tutor ---
    const KEYWORD_RESPONSE =
        'Cuando buscas un bug en un bucle <code class="code-inline">for</code> en Python, ' +
        'revisa qué valor se está sumando en cada vuelta. ' +
        'Si quieres sumar todos los elementos de una lista, normalmente deberías acumular ' +
        'el valor de la variable del bucle (por ejemplo, <code class="code-inline">n</code>), ' +
        'no un número fijo. Piensa qué pasaría si cambias la lista de valores 😉';

    const DEFAULT_RESPONSE = 'No he entendido tu consulta, escríbela de nuevo.';
    const KEYWORDS = ['ayuda']; // Solo reaccionamos a "ayuda"

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

    // Valida que el bug esté corregido (sin dar la solución exacta al alumno)
    const validateSolution = (code) => {
        const cleaned = code.replace(/\s+/g, ' ');

        // Línea incorrecta original
        const hasBugLine = /total\s*=\s*total\s*\+\s*1/.test(cleaned);

        // Posibles correcciones simples típicas para principiantes
        const hasFixedLine = /total\s*=\s*total\s*\+\s*n/.test(cleaned) ||
                             /total\s*\+=\s*n/.test(cleaned);

        return !hasBugLine && hasFixedLine;
    };

    // =========================================================
    // NAVEGACIÓN INFERIOR (MÓVIL)
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

    // =========================================================
    // MENÚ HAMBURGUESA HEADER
    // =========================================================
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

    // =========================================================
    // CHAT
    // =========================================================
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

    // =========================================================
    // BOTONES EDITOR: VERIFICAR, COPIAR, RESET
    // =========================================================
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
                        '¡Genial! Has corregido correctamente el bug en la suma.',
                        'Reto completado ✔️',
                        false
                    );
                    openXpModal();
                } else {
                    showTerminalMessage(
                        'Parece que la suma todavía no es correcta. Revisa qué valor sumas en cada vuelta del bucle.',
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

    // =========================================================
    // MODAL XP
    // =========================================================
    if (xpModalHomeBtn) {
        xpModalHomeBtn.addEventListener('click', () => {
            window.location.href = 'home.html';
        });
    }

    // =========================================================
    // INICIALIZACIÓN
    // =========================================================
    if (codeEditor) {
        codeEditor.value = BUGGY_CODE;
    }

    showTerminalMessage(
        'Listo. Observa la función suma_lista e intenta encontrar el bug en el bucle.',
        'Reto pendiente ⚙️',
        false
    );
});
