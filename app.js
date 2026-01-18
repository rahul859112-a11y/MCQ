let data = null;
let isSubmitted = false;
let currentCategory = "award";
let wrongQuestions = [];

/* CATEGORY BUTTONS */
document.querySelectorAll("#categoryBox button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll("#categoryBox button")
      .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    loadCategory(btn.dataset.category);
  };
});

document.getElementById("actionBtn").onclick = handleButton;

/* LOAD CATEGORY */
function loadCategory(category) {
  currentCategory = category;
  isSubmitted = false;
  wrongQuestions = [];
  document.getElementById("actionBtn").innerText = "Submit Test";
  document.getElementById("reportBtn").style.display = "none";
  fetch(`questions/${category}.json`)
    .then(res => res.json())
    .then(json => {
      data = json;
      shuffleOptions();
      document.getElementById("subject").innerText = data.category;
      loadQuestions();
    });
}

/* SHUFFLE OPTIONS */
function shuffleOptions() {
  data.questions.forEach(q => {
    for (let i = q.options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [q.options[i], q.options[j]] = [q.options[j], q.options[i]];
    }
  });
}

/* LOAD QUESTIONS */
function loadQuestions() {
  const quiz = document.getElementById("quiz");
  quiz.innerHTML = "";

  data.questions.forEach((q, i) => {
    quiz.innerHTML += `
      <div class="question" id="q-${i}">
        <p><b>${i + 1}. ${q.question}</b></p>

        <div class="options">
          ${q.options.map(opt =>
            `<div class="option" data-q="${i}" data-val="${opt}">${opt}</div>`
          ).join("")}
        </div>

        <button class="show-answer-btn" data-q="${i}">Show Answer</button>
        <div class="correct-answer" id="ans-${i}" style="display:none;">
          ✔ ${q.answer}
        </div>
        <hr>
      </div>
    `;
  });

  enableOptionClick();
  enableShowAnswerToggle();
}

/* OPTION CLICK */
function enableOptionClick() {
  document.querySelectorAll(".option").forEach(opt => {
    opt.onclick = function () {
      if (isSubmitted) return;
      document.querySelectorAll(`.option[data-q="${this.dataset.q}"]`)
        .forEach(o => o.classList.remove("selected"));
      this.classList.add("selected");
    };
  });
}

/* SHOW / HIDE ANSWER TOGGLE */
function enableShowAnswerToggle() {
  document.querySelectorAll(".show-answer-btn").forEach(btn => {
    btn.onclick = function () {
      const ans = document.getElementById(`ans-${this.dataset.q}`);
      if (ans.style.display === "none") {
        ans.style.display = "block";
        this.innerText = "Hide Answer";
        this.classList.add("active");
      } else {
        ans.style.display = "none";
        this.innerText = "Show Answer";
        this.classList.remove("active");
      }
    };
  });
}

/* SUBMIT TEST */
function submitTest() {
  let attempted = 0, correct = 0, wrong = 0;
  wrongQuestions = [];

  data.questions.forEach((q, i) => {
    const options = document.querySelectorAll(`.option[data-q="${i}"]`);
    let selected = null;

    options.forEach(o => {
      if (o.classList.contains("selected")) selected = o;
      if (o.dataset.val === q.answer) o.classList.add("correct");
    });

    if (selected) {
      attempted++;
      if (selected.dataset.val === q.answer) correct++;
      else {
        wrong++;
        selected.classList.add("wrong-selected");
        wrongQuestions.push(i + 1);
      }
    }

    document.getElementById(`ans-${i}`).style.display = "block";
  });

  showReport(attempted, correct, wrong,
    data.questions.length - attempted,
    data.questions.length);
}

/* REPORT */
function showReport(a, c, w, u, t) {
  document.getElementById("reportContent").innerHTML = `
    <p>Total: <b>${t}</b></p>
    <p>Attempted: <b>${a}</b></p>
    <p>Correct: <b>${c}</b></p>
    <p>Wrong: <b>${w}</b></p>
    <p>Score: <b>${Math.round((c/t)*100)}%</b></p>
    ${
      w
        ? wrongQuestions.map(q =>
            `<button class="jump-btn"
              onclick="jumpToQuestion(${q}); switchToReportBtn();">
              Q${q}
            </button>`
          ).join("")
        : "<p>🎉 Perfect Score!</p>"
    }
  `;
  document.getElementById("reportModal").style.display = "block";
}

/* REPORT BUTTON LOGIC */
function closeReport() {
  document.getElementById("reportModal").style.display = "none";
  document.getElementById("reportBtn").style.display = "block";
}
function openReport() {
  document.getElementById("reportModal").style.display = "block";
  document.getElementById("reportBtn").style.display = "none";
}
function switchToReportBtn() {
  closeReport();
}

/* JUMP */
function jumpToQuestion(q) {
  document.getElementById(`q-${q - 1}`)
    .scrollIntoView({ behavior: "smooth" });
}

/* MAIN BUTTON */
function handleButton() {
  if (!isSubmitted) {
    submitTest();
    isSubmitted = true;
    actionBtn.innerText = "Restart Test";
  } else {
    loadCategory(currentCategory);
  }
}

/* START */
loadCategory("award");