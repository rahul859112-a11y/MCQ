let data = null;
let isSubmitted = false;
let currentCategory = "award";

/* 🔹 Category button binding (MOBILE SAFE) */
document.querySelectorAll("#categoryBox button").forEach(btn => {
  btn.addEventListener("click", () => {
    loadCategory(btn.dataset.category);
  });
});

/* 🔹 Action button */
document.getElementById("actionBtn").addEventListener("click", handleButton);

/* 🔹 Load Category */
function loadCategory(category) {
  currentCategory = category;
  isSubmitted = false;
  document.getElementById("actionBtn").innerText = "Submit Test";
  fetchMCQData();
}

/* 🔹 Fetch JSON */
function fetchMCQData() {
  fetch(`questions/${currentCategory}.json`)
    .then(res => {
      if (!res.ok) throw new Error("File not found");
      return res.json();
    })
    .then(json => {
      data = json;
      document.getElementById("subject").innerText = data.category;
      loadQuestions();
    })
    .catch(err => {
      alert(`Category "${currentCategory}" not loading.\nCheck file name & extension.`);
      console.error(err);
    });
}

/* 🔹 Load Questions */
function loadQuestions() {
  const quiz = document.getElementById("quiz");
  quiz.innerHTML = "";
  document.getElementById("scoreBox").innerHTML = "";

  data.questions.forEach((q, qi) => {
    let html = `
      <div class="question">
        <p><b>${qi + 1}. ${q.question}</b></p>
        <div class="options">
    `;

    q.options.forEach((opt, i) => {
      const letter = String.fromCharCode(65 + i);
      html += `
        <div class="option" data-q="${qi}" data-val="${opt}">
          <b>${letter}.</b> ${opt}
        </div>
      `;
    });

    html += `
        </div>
        <div class="correct-answer" id="ans-${qi}" style="display:none;"></div>
        <hr>
      </div>
    `;

    quiz.innerHTML += html;
  });

  enableOptionClick();
}

/* 🔹 Option Click */
function enableOptionClick() {
  document.querySelectorAll(".option").forEach(opt => {
    opt.addEventListener("click", function () {
      if (isSubmitted) return;

      const q = this.dataset.q;
      document
        .querySelectorAll(`.option[data-q="${q}"]`)
        .forEach(o => o.classList.remove("selected"));

      this.classList.add("selected");
    });
  });
}

/* 🔹 Submit Test */
function submitTest() {
  let attempted = 0, correct = 0, wrong = 0;

  data.questions.forEach((q, i) => {
    const options = document.querySelectorAll(`.option[data-q="${i}"]`);
    const ansBox = document.getElementById(`ans-${i}`);
    let selected = null;

    options.forEach(o => {
      if (o.classList.contains("selected")) selected = o;
    });

    if (selected) attempted++;

    options.forEach(o => {
      o.classList.remove("selected");
      if (o.dataset.val === q.answer) o.classList.add("correct");
    });

    if (selected) {
      if (selected.dataset.val === q.answer) correct++;
      else {
        selected.classList.add("wrong-selected");
        wrong++;
      }
    }

    ansBox.innerHTML = `✔ Correct Answer: <b>${q.answer}</b>`;
    ansBox.style.display = "block";
  });

  const total = data.questions.length;
  showScore(attempted, correct, wrong, total - attempted, total);
}

/* 🔹 Score Display */
function showScore(a, c, w, u, t) {
  document.getElementById("scoreBox").innerHTML = `
    <div class="score-card">
      <div class="score-item attempted">Attempted: <b>${a}</b></div>
      <div class="score-item correct">Correct: <b>${c}</b></div>
      <div class="score-item wrong">Wrong: <b>${w}</b></div>
      <div class="score-item unattempted">Unattempted: <b>${u}</b></div>
      <div class="score-item total">Total: <b>${t}</b></div>
    </div>
  `;
}

/* 🔹 Button Handler */
function handleButton() {
  if (!isSubmitted) {
    submitTest();
    this.innerText = "Restart Test";
    isSubmitted = true;
  } else {
    loadCategory(currentCategory);
  }
}

/* 🔹 Start */
loadCategory("award");
