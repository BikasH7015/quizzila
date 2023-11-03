
document.addEventListener('DOMContentLoaded', function() {
    const quizContainer = document.getElementById('quiz');
    const nextButton = document.getElementById('nextBtn');
    const submitButton = document.getElementById('submitBtn');
    const resultContainer = document.getElementById('result');
    const subjectDropdown = document.getElementById('subject');
    const restartButton = document.getElementById('restartBtn');
    const showDetailsButton = document.getElementById('showDetailsBtn');
    const detailsContainer = document.getElementById('detailsContainer');
    const correctQuestionsContainer = document.getElementById('correctQuestions');
    const incorrectQuestionsContainer = document.getElementById('incorrectQuestions');

    let currentQuestionIndex = 0;
    let score = 0;
    let questions = [];
    let timerSeconds = 600; // 10 minutes in seconds
    let testStarted = false; // Variable to track if the test has started


    function updateTimerDisplay() {
        const minutes = Math.floor(timerSeconds / 60);
        const seconds = timerSeconds % 60;
        const timerDisplay = document.getElementById('timer');
        timerDisplay.textContent = `Time remaining: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function startTimer() {
        timerInterval = setInterval(function() {
            if (timerSeconds > 0) {
                timerSeconds--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval); // Stop the timer
                alert('Time is up!'); // You can customize this action when time is up.
            }
        }, 1000); // Update every second
    }

    function loadQuestions(subject) {
        subjectDropdown.disabled = true; // Disable subject selection
        fetch(`https://quizzila.s3.eu-north-1.amazonaws.com/${subject}.json`)
            .then(response => response.json())
            .then(data => {
                questions = data;
                showQuestion(currentQuestionIndex);
            })
            .catch(error => console.error('Error fetching questions:', error));
    }

    function showQuestion(index) {
        quizContainer.innerHTML = '';
        quizContainer.appendChild(buildQuestionElement(questions[index]));
        if (index === questions.length - 1) {
            nextButton.classList.add('hidden');
            submitButton.classList.remove('hidden');
        }
    }

    function buildQuestionElement(question) {
        const questionElement = document.createElement('div');
        questionElement.classList.add('mb-4');
        questionElement.innerHTML = `
            <div class="font-bold">${question.question}</div>
            <div class="mt-2">
                ${question.options.map(option => `
                    <div>
                        <label class="inline-flex items-center">
                            <input type="radio" class="form-radio" name="question${question.id}" value="${option}">
                            <span class="ml-2">${option}</span>
                        </label>
                    </div>
                `).join('')}
            </div>
        `;
        return questionElement;
    }

    nextButton.addEventListener('click', function() {
        if (testStarted) {
            const selectedOption = document.querySelector(`input[name="question${questions[currentQuestionIndex].id}"]:checked`);
            if (selectedOption) {
                if (selectedOption.value === questions[currentQuestionIndex].correctAnswer) {
                    score++;
                }
                currentQuestionIndex++;
                if (currentQuestionIndex < questions.length) {
                    showQuestion(currentQuestionIndex);
                } else {
                    resultContainer.textContent = `Your score is ${score} out of ${questions.length}`;
                    clearInterval(timerInterval); // Stop the timer
                }
            } else {
                alert('Please select an option before proceeding.');
            }
        } else {
            alert('Please select a subject to start the test.');
        }
    });


    submitButton.addEventListener('click', function() {
        clearInterval(timerInterval); // Stop the timer
        const totalQuestions = questions.length;
        const accuracy = ((score / totalQuestions) * 100).toFixed(2); // Calculate accuracy
        const minutes = Math.floor((600 - timerSeconds) / 60);
        const seconds = (600 - timerSeconds) % 60;
        const timeTaken = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
        resultContainer.innerHTML = `
            <div>Your score is ${score} out of ${totalQuestions}</div>
            <div>Accuracy: ${accuracy}%</div>
            <div>Time taken: ${timeTaken}</div>
        `;
        restartButton.classList.remove('hidden');
        restartButton.addEventListener('click', function() {
            location.reload(); // Reload the page
        });
    
        // Show Details Button Functionality
        showDetailsButton.classList.remove('hidden');
    
        showDetailsButton.addEventListener('click', function() {
            detailsContainer.classList.toggle('hidden');
    
            correctQuestionsContainer.innerHTML = '<h3>Correct Questions:</h3>';
            incorrectQuestionsContainer.innerHTML = '<h3>Incorrect Questions:</h3>';
    
            questions.forEach((question, index) => {
                const questionElement = buildQuestionElement(question);
                const selectedOption = document.querySelector(`input[name="question${question.id}"]:checked`);
    
                const questionContainer = document.createElement('div');
                questionContainer.classList.add(selectedOption && selectedOption.value === question.correctAnswer ? 'text-green-500' : 'text-red-500');
                questionContainer.innerHTML = questionElement.innerHTML;
    
                if (selectedOption && selectedOption.value === question.correctAnswer) {
                    correctQuestionsContainer.appendChild(questionContainer);
                } else {
                    incorrectQuestionsContainer.appendChild(questionContainer);
                    const correctAnswerElement = document.createElement('div');
                    correctAnswerElement.classList.add('font-bold');
                    correctAnswerElement.textContent = `Correct Answer: ${question.correctAnswer}`;
                    incorrectQuestionsContainer.appendChild(correctAnswerElement);
                }
            });
        });
    });
    

    subjectDropdown.addEventListener('change', function() {
        if (subjectDropdown.value !== '') {
            testStarted = true;
            subjectDropdown.disabled = true; // Disable subject selection after starting the test
            loadQuestions(subjectDropdown.value);
            startTimer();
        }
    });
});
