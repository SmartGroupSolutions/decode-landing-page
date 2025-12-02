
document.addEventListener('DOMContentLoaded', () => {
    const codeEditor = document.getElementById('main-code-editor');
    const compileButton = document.querySelector('.btn--compile');
    const exerciseCards = document.querySelectorAll('.exercise__card');
    const chatInput = document.querySelector('.chat-column__input input');
    const sendButton = document.querySelector('.btn--send');
    const chatContent = document.querySelector('.chat-column__content');
    
    const copyButton = document.getElementById('btn-copy');
    const resetButton = document.getElementById('btn-reset');
    const btnLoad = document.getElementById('btn-load');
    const saveButtonConfirm = document.getElementById('btn-save-confirm');
    const saveFilenameInput = document.getElementById('save-filename');
    const savedFilesList = document.getElementById('saved-files-list');
    
    const terminalOutput = document.querySelector('.terminal__output');
    const statusFooter = document.querySelector('.editor__footer-item--status');

    const KEYWORD_RESPONSE = '¡Excelente pregunta! Para declarar una variable entera en C++ y asignarle un valor, usas la palabra clave <code class="code-inline">int</code>.<br><br>Por ejemplo: <code class="code-inline">int edad = 30;</code> ¡Inténtalo ahora en el editor!';
    const DEFAULT_RESPONSE = 'No he entendido tu consulta, escríbela de nuevo';
    const KEYWORDS = ['ayuda', 'verificar', 'variable', 'variables'];

    const exercisesData = {
        'ex1': {
            regex: /#include\s*<iostream>.*using\s+namespace\s+std;.*int\s+main\s*\(\)\s*\{[^}]*cout\s*<<\s*["']¡Hola, mundo!["']\s*<<\s*endl;[^}]*return\s+0;\s*\}/si,
            initialCode: `#include <iostream>
using namespace std;

int main() {
    // Escribe tu código aquí. ¡Recuerda el mensaje!
    return 0;
}`
        },
        'ex2': {
            regex: /#include\s*<string>.*int\s+edad\s*[^;]*;.*string\s+nombre\s*[^;]*;.*cout\s*<<\s*[^;]*(nombre|edad)\s*[^;]*(nombre|edad)\s*[^;]*;/si,
            initialCode: `#include <iostream>
#include <string> // Necesario para usar string
using namespace std;

int main() {
    // Declara y asigna 'edad' (int) y 'nombre' (string)
    // Luego, imprime un mensaje que las combine
    return 0;
}`
        }
    };

    let currentExerciseId = null;
    const activeTabClass = 'info-column__tab--active';
    const hiddenClass = 'info-column__content--hidden';
    const activeExerciseClass = 'exercise__card--active';
    const completedStatusClass = 'exercise__status-indicator--completed';
    const tabButtons = document.querySelectorAll('.info-column__tab');
    const sectionTheory = document.getElementById('section-theory');
    const sectionExercises = document.getElementById('section-exercises');

    // =========================================================
    // LÓGICA DE RETROALIMENTACIÓN VISUAL
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


    // =========================================================
    // LÓGICA DE ALMACENAMIENTO (LOCALSTORAGE)
    // =========================================================

    const getSavedFiles = () => {
        try {
            return JSON.parse(localStorage.getItem('saved_code_files')) || {};
        } catch (e) {
            console.error("Error al parsear saved_code_files de LocalStorage", e);
            return {};
        }
    };

    const renderSavedFiles = () => {
        const files = getSavedFiles();
        const filenames = Object.keys(files);
        savedFilesList.innerHTML = ''; 

        if (filenames.length === 0) {
            savedFilesList.innerHTML = '<li>No hay archivos guardados.</li>';
            return;
        }

        filenames.forEach(filename => {
            const li = document.createElement('li');
            li.textContent = filename;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-file-btn');
            deleteBtn.textContent = 'x';
            deleteBtn.title = `Eliminar ${filename}`;
            
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                deleteFile(filename);
            });

            li.appendChild(deleteBtn);
            
            li.addEventListener('click', () => {
                loadFile(filename);
            });

            savedFilesList.appendChild(li);
        });
    };

    const saveFile = (filename, content) => {
        try {
            let files = getSavedFiles();
            
            if (!filename.toLowerCase().endsWith('.txt')) {
                filename += '.txt';
            }
            
            files[filename] = content;
            localStorage.setItem('saved_code_files', JSON.stringify(files));
            
            showTerminalMessage(`Archivo "${filename}" guardado exitosamente.`, "Guardado ✔️", false);
            saveFilenameInput.value = ''; 
        } catch (e) {
            console.error("Error al guardar en LocalStorage:", e);
            showTerminalMessage("Error al guardar el archivo. LocalStorage lleno o no disponible.", "Error ❌", true);
        }
    };

    const loadFile = (filename) => {
        try {
            const files = getSavedFiles();
            const content = files[filename];
            
            if (content !== undefined) {
                codeEditor.value = content;
                showTerminalMessage(`Archivo "${filename}" cargado en el editor.`, "Cargado ✔️", false);
                
                currentExerciseId = null;
                exerciseCards.forEach(c => c.classList.remove(activeExerciseClass));
                
            } else {
                showTerminalMessage(`Error: Archivo "${filename}" no encontrado.`, "Error de Carga ❌", true);
            }
        } catch (e) {
            console.error("Error al cargar desde LocalStorage:", e);
            showTerminalMessage("Error al cargar el archivo desde el almacenamiento local.", "Error de Carga ❌", true);
        }
    };

    const deleteFile = (filename) => {
        try {
            let files = getSavedFiles();
            if (!files[filename]) {
                 showTerminalMessage(`Error: Archivo "${filename}" no existe para ser eliminado.`, "Error al eliminar ❌", true);
                 return;
            }
            delete files[filename];
            localStorage.setItem('saved_code_files', JSON.stringify(files));
            showTerminalMessage(`Archivo "${filename}" eliminado.`, "Eliminado ✔️", false);
            renderSavedFiles(); 
        } catch (e) {
            console.error("Error al eliminar de LocalStorage:", e);
            showTerminalMessage("Error al eliminar el archivo.", "Error al eliminar ❌", true);
        }
    };

    // =========================================================
    // LÓGICA DE CHAT INTERACTIVO
    // =========================================================

    function addMessage(text, sender) {
        const chatMessageDiv = document.createElement('div');
        chatMessageDiv.classList.add('chat-message');
        
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });

        if (sender === 'user') {
            chatMessageDiv.classList.add('chat-message--user');
            chatMessageDiv.innerHTML = `
                <p class="chat-message__text chat-message__text--user">
                    ${text}
                </p>
            `;
        } else if (sender === 'tutor') {
            chatMessageDiv.classList.add('chat-message--tutor');
            chatMessageDiv.innerHTML = `
                <p class="chat-message__time">${timeString}</p>
                <p class="chat-message__text">
                    ${text}
                </p>
            `;
        }
        
        chatContent.appendChild(chatMessageDiv);
        chatContent.scrollTop = chatContent.scrollHeight;
    }
    
    function handleSendMessage() {
        const userInput = chatInput.value.trim();
        if (userInput === '') return;

        addMessage(userInput, 'user');
        
        const lowerCaseInput = userInput.toLowerCase();
        let tutorResponse = DEFAULT_RESPONSE;
        
        if (KEYWORDS.some(keyword => lowerCaseInput.includes(keyword))) {
            tutorResponse = KEYWORD_RESPONSE;
        }

        setTimeout(() => {
            addMessage(tutorResponse, 'tutor');
        }, 500);

        chatInput.value = '';
    }

    if (sendButton) {
        sendButton.addEventListener('click', handleSendMessage);
    }
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); 
                handleSendMessage();
            }
        });
    }

    // =========================================================
    // LÓGICA DE BOTONES DE CONTROL (COPIAR, GUARDAR, CARGAR, RESET)
    // =========================================================

    if (copyButton) {
        copyButton.addEventListener('click', async () => {
            try {
                if (codeEditor.value.trim() === '') {
                    showTerminalMessage("El editor está vacío. No hay contenido para copiar.", "Copiado pendiente", true);
                    return;
                }
                await navigator.clipboard.writeText(codeEditor.value);
                showTerminalMessage("Código copiado al portapapeles.", "Copiado ✔️", false);
            } catch (err) {
                console.error('Error al copiar: ', err);
                showTerminalMessage("Error al copiar el código. Intenta copiar manualmente (Ctrl+C).", "Error ❌", true);
            }
        });
    }

    if (saveButtonConfirm) {
        saveButtonConfirm.addEventListener('click', () => {
            const filename = saveFilenameInput.value.trim();
            const content = codeEditor.value;
            
            if (filename === '') {
                showTerminalMessage("Introduce un nombre para el archivo antes de guardar.", "Guardar pendiente", true);
                return;
            }
            if (content.trim() === '') {
                showTerminalMessage("El editor está vacío. No hay nada que guardar.", "Guardar pendiente", true);
                return;
            }
            
            saveFile(filename, content);
        });
    }

    if (resetButton) {
        resetButton.addEventListener('click', () => {
            codeEditor.value = ''; 
            currentExerciseId = null; 
            showTerminalMessage(`Editor reseteado. Código borrado.`, "Reseteado ✔️", false);
            exerciseCards.forEach(c => c.classList.remove(activeExerciseClass));
        });
    }

    // 4. Lógica del menú Cargar (Renderizar al hacer hover)
    if (btnLoad) {
        btnLoad.parentElement.addEventListener('mouseenter', renderSavedFiles);
    }

    // =========================================================
    // LÓGICA DE EJERCICIOS
    // =========================================================
    
    const selectExercise = (id) => {
        currentExerciseId = id;
        const card = document.querySelector(`.exercise__card[data-exercise-id="${id}"]`);
        const exercise = exercisesData[id];

        exerciseCards.forEach(c => c.classList.remove(activeExerciseClass));
        if (card) {
            card.classList.add(activeExerciseClass);
        }

        if (codeEditor && exercise) {
            if (id === 'ex1') {
                codeEditor.value = ''; 
            } else {
                codeEditor.value = exercise.initialCode.trim();
            }
            codeEditor.focus();
        }
        
        showTerminalMessage(`Ejercicio ${id} seleccionado. Escribe tu código.`, `Ejercicio: ${id} activo`, false);
    }
    
    const switchTab = (targetTab) => {
        tabButtons.forEach(btn => btn.classList.remove(activeTabClass));
        document.querySelector(`[data-tab="${targetTab}"]`).classList.add(activeTabClass);

        if (targetTab === 'theory') {
            sectionTheory.classList.remove(hiddenClass);
            sectionExercises.classList.add(hiddenClass);
            exerciseCards.forEach(c => c.classList.remove(activeExerciseClass));
            currentExerciseId = null;
        } else if (targetTab === 'exercises') {
            sectionTheory.classList.add(hiddenClass);
            sectionExercises.classList.remove(hiddenClass);
            
            if (!currentExerciseId) {
                selectExercise('ex1'); 
            }
        }
    };

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    exerciseCards.forEach(card => {
        card.addEventListener('click', () => {
            const id = card.getAttribute('data-exercise-id');
            selectExercise(id);
        });
    });
    
    if (compileButton) {
        compileButton.addEventListener('click', () => {
            if (!currentExerciseId) {
                showTerminalMessage("Por favor, selecciona un ejercicio antes de Compilar.", "Compilación pendiente", true);
                return;
            }

            const currentCode = codeEditor.value;
            const targetRegex = exercisesData[currentExerciseId].regex;
            const statusIndicator = document.getElementById(`status-${currentExerciseId}`);
            
            terminalOutput.innerHTML = `<span style="color: #999999;">Compilando código...</span>`;
            statusFooter.textContent = `Compilando...`;
            statusFooter.style.color = '#999999'; 

            const cleanedCode = currentCode.replace(/\s+/g, ' ').trim();
            const isCompleted = targetRegex.test(cleanedCode);

            setTimeout(() => { 
                if (isCompleted) {
                    if (statusIndicator) {
                        statusIndicator.classList.add(completedStatusClass);
                    }
                    showTerminalMessage("Compilación exitosa. ¡Ejercicio completado!", "¡COMPLETADO! 🎉", false);

                } else {
                    showTerminalMessage(
                        `Error de Verificación: El código no cumple con los requisitos del ejercicio. Revisa los pasos.`, 
                        "Error de Verificación ❌", 
                        true
                    );
                }
            }, 500);
        });
    }

    if (codeEditor) {
        codeEditor.value = ''; 
    }
    renderSavedFiles(); 
});