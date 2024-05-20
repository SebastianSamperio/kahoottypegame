const menuContainer = document.getElementById('menu-container');
const gameContainer = document.getElementById('game-container');
const startButton = document.getElementById('start-btn');
const questionContainer = document.getElementById('question-container');
const questionElement = document.getElementById('question');
const answerButtonsElement = document.getElementById('answer-buttons');
const nextButton = document.getElementById('next-btn');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const incorrectElement = document.getElementById('incorrect');

let shuffledQuestions, currentQuestionIndex;
let score = 0;
let incorrectCount = 0; // Contador de respuestas incorrectas
let timeLeft;
let timerInterval;
let answeredCorrectly = false;

startButton.addEventListener('click', startGame);

function startGame() {
    menuContainer.classList.add('d-none');
    gameContainer.classList.remove('d-none');
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            shuffledQuestions = data.sort(() => Math.random() - 0.5);
            currentQuestionIndex = 0;
            score = 0;
            incorrectCount = 0; // Reiniciar el contador de respuestas incorrectas
            setNextQuestion();
        });
}

function setNextQuestion() {
    resetState();
    showQuestion(shuffledQuestions[currentQuestionIndex]);
    startTimer();
}

function showQuestion(question) {
    questionElement.innerText = question.question;
    question.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer.text;
        button.classList.add('btn', 'btn-primary', 'animate__animated', 'animate__fadeIn');
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener('click', selectAnswer);
        answerButtonsElement.appendChild(button);
    });
}

function resetState() {
    clearInterval(timerInterval);
    timeLeft = 10;
    timerElement.innerText = `Tiempo: ${timeLeft}`;
    nextButton.classList.add('d-none');
    answeredCorrectly = false;
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

function selectAnswer(e) {
    const selectedButton = e.target;
    if (answeredCorrectly) return;
    const correct = selectedButton.dataset.correct === 'true';
    if (correct) {
        score++;
        scoreElement.innerText = `Puntuación: ${score}`;
        answeredCorrectly = true;
        Swal.fire({
            icon: 'success',
            title: 'Correcto',
            text: '¡Buena respuesta!',
            timer: 1000,
            showConfirmButton: false,
            position: 'center',
            backdrop: false,
        }).then(() => {
            if (shuffledQuestions.length > currentQuestionIndex + 1) {
                currentQuestionIndex++;
                setNextQuestion();
            } else {
                endGame();
            }
        });
    } else {
        selectedButton.classList.add('wrong');
        Swal.fire({
            icon: 'error',
            title: 'Incorrecto',
            text: 'Respuesta equivocada',
            timer: 1000,
            showConfirmButton: false,
            position: 'center',
            backdrop: false,
        }).then(() => {
            incorrectCount++; // Incrementar el contador de respuestas incorrectas
            incorrectElement.innerText = `Respuestas incorrectas: ${incorrectCount}`; // Actualizar el contador en el tablero
            if (shuffledQuestions.length > currentQuestionIndex + 1) {
                currentQuestionIndex++;
                setNextQuestion();
            } else {
                endGame();
            }
        });
    }
    Array.from(answerButtonsElement.children).forEach(button => {
        setStatusClass(button, button.dataset.correct === 'true');
    });
    clearInterval(timerInterval);
}

function setStatusClass(element, correct) {
    clearStatusClass(element);
    if (correct) {
        element.classList.add('correct');
    } else {
        element.classList.add('wrong');
    }
}

function clearStatusClass(element) {
    element.classList.remove('correct');
    element.classList.remove('wrong');
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.innerText = `Tiempo: ${timeLeft}`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (!answeredCorrectly) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Tiempo agotado',
                    text: 'Se acabó el tiempo para esta pregunta.',
                    timer: 1000,
                    showConfirmButton: false,
                    position: 'center',
                    backdrop: false,
                }).then(() => {
                    if (shuffledQuestions.length > currentQuestionIndex + 1) {
                        currentQuestionIndex++;
                        setNextQuestion();
                    } else {
                        endGame();
                    }
                });
            }
        }
    }, 1000);
}

function endGame() {
    questionContainer.style.display = 'none';
    Swal.fire({
        icon: 'info',
        title: 'Juego terminado',
        text: `Tu puntuación final es de: ${score}.          Respuestas incorrectas: ${incorrectCount}`,
        showConfirmButton: true,
        position: 'center',
        backdrop: false,
    }).then(() => {
        resetToMenu();
    });
}

function resetToMenu() {
    gameContainer.classList.add('d-none');
    menuContainer.classList.remove('d-none');
    questionContainer.style.display = 'block';
}
