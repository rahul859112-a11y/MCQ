let data = null;
let isSubmitted = false;

/* 🔹 Fetch MCQ data */
function fetchMCQData() {
  fetch("questions/award.json")
    .then(res => res.json())
    .then(jsonData => {
      data = jsonData;
      document.getElementById("subject").innerText = data.category;
      loadQuestions();
    })
    .catch(() => alert("Run app using a server"));
}

/* 🔹 Load questions */
function loadQuestions() {
  const quizDiv = document.getElementById("quiz");
  quizDiv.innerHTML = "";
  document.getElementById("scoreBox").innerHTML = "";

  data.questions.forEach((q, qIndex) => {
    let html = `
      <div class="question">
        <p><b>${qIndex + 1}. ${q.question}</b></p>
        <div class="options">
    `;

    q.options.forEach((opt, i) => {
      const letter = String.fromCharCode(65 + i);
      html += `
        <div class="option"
             data-question="${qIndex}"
             data-value="${opt}">
          <b>${letter}.</b> ${opt}
        </div>
      `;
    });

    html += `
        </div>
        <p class="correct-answer" id="answer-${qIndex}" style="display:none;"></p>
        <hr>
      </div>
    `;

    quizDiv.innerHTML += html;
  });

  enableOptionClick();
}

/* 🔹 Option click (BEFORE SUBMIT) */
function enableOptionClick() {
  document.querySelectorAll(".option").forEach(option => {
    option.addEventListener("click", function () {
      if (isSubmitted) return;

      const qIndex = this.dataset.question;

      document
        .querySelectorAll(`.option[data-question="${qIndex}"]`)
        .forEach(opt => opt.classList.remove("selected"));

      this.classList.add("selected");
    });
  });
}

/* 🔹 Submit Test */
function submitTest() {
  let attempted = 0;
  let correct = 0;
  let wrong = 0;

  data.questions.forEach((q, index) => {
    const options = document.querySelectorAll(
      `.option[data-question="${index}"]`
    );
    const answerDiv = document.getElementById(`answer-${index}`);

    let selectedOption = null;

    // find selected
    options.forEach(opt => {
      if (opt.classList.contains("selected")) {
        selectedOption = opt;
        attempted++;
      }
    });

    // apply final colors
    options.forEach(opt => {
      opt.classList.remove("selected"); // 🔥 remove blue state

      const value = opt.dataset.value;

      if (value === q.answer) {
        opt.classList.add("correct"); // green
      }
    });

    // wrong selected
    if (selectedOption) {
      if (selectedOption.dataset.value === q.answer) {
        correct++;
      } else {
        selectedOption.classList.add("wrong-selected"); // 🔴 different color
        wrong++;
      }
    }

    answerDiv.innerHTML = `✔ Correct Answer: <b>${q.answer}</b>`;
    answerDiv.style.display = "block";
  });

  const total = data.total_questions;
  const unattempted = total - attempted;

  showScore(attempted, correct, wrong, unattempted, total);
}

/* 🔹 Show score */
function showScore(attempted, correct, wrong, unattempted, total) {
  document.getElementById("scoreBox").innerHTML = `
    <div class="score-card">
      <div class="score-item attempted">Attempted: <b>${attempted}</b></div>
      <div class="score-item correct">Correct: <b>${correct}</b></div>
      <div class="score-item wrong">Wrong: <b>${wrong}</b></div>
      <div class="score-item unattempted">Unattempted: <b>${unattempted}</b></div>
      <div class="score-item total">Total: <b>${total}</b></div>
    </div>
  `;
}

/* 🔹 Restart Test */
function restartTest() {
  isSubmitted = false;
  document.getElementById("actionBtn").innerText = "Submit Test";
  fetchMCQData();
}

/* 🔹 Button handler */
function handleButton() {
  const btn = document.getElementById("actionBtn");

  if (!isSubmitted) {
    submitTest();
    btn.innerText = "Restart Test";
    isSubmitted = true;
  } else {
    restartTest();
  }
}

/* ✅ Start */
fetchMCQData();
