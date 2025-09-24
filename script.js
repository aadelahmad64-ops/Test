// script.js — quiz logic (4 sections, 5 theory, 5 practical)
// ---------------------------
// Config & Questions
const theoryQuestions = [
  {
    q: "You ask someone a question and they briefly raise one eyebrow. This most likely indicates:",
    options: ["Surprise or skepticism","Joy","Fear","Disgust"],
    answer: 0,
    explanation: "A unilateral eyebrow raise commonly signals skepticism or quick surprise; Ekman's literature highlights eyebrow movements as cues to doubt/surprise."
  },
  {
    q: "Tightened lips and staring eyes during a short moment typically signal:",
    options: ["Anger","Happiness","Sadness","Contempt"],
    answer: 0,
    explanation: "Tightened lips with focused stare are classic brief indicators of anger or hostility."
  },
  {
    q: "A Duchenne (genuine) smile is characterized by:",
    options: ["Only mouth movement","Mouth + eye (orbicularis) involvement","Raised nostrils","Lowered brows"],
    answer: 1,
    explanation: "True smiles engage orbicularis oculi causing 'crow's feet' — genuine happiness sign."
  },
  {
    q: "A wrinkled nose and raised upper lip in a micro moment usually means:",
    options: ["Surprise","Disgust","Fear","Sadness"],
    answer: 1,
    explanation: "Disgust often shows nose wrinkle and upper lip raise — a cross-cultural facial cue."
  },
  {
    q: "Rapid widening of the eyes and raised brows typically indicates:",
    options: ["Anger","Surprise","Happiness","Contempt"],
    answer: 1,
    explanation: "Widened eyes with raised brows correspond to surprise — a rapid involuntary reaction."
  }
];

const practicalQuestions = [
  // filenames must exist in images/ with these exact names
  { img: "images/happiness.png", options:["Anger","Happiness","Fear","Disgust"], answer: 1, explanation: "Smile reaches the eyes (Duchenne) — happiness." },
  { img: "images/anger.png", options:["Anger","Surprise","Disgust","Sadness"], answer: 0, explanation: "Furrowed brows and compressed lips point to anger." },
  { img: "images/fear.png", options:["Fear","Happiness","Disgust","Surprise"], answer: 0, explanation: "Wide eyes and slightly open mouth indicate fear." },
  { img: "images/surprise.png", options:["Disgust","Surprise","Sadness","Anger"], answer: 1, explanation: "Raised brows and open eyes signal surprise." },
  { img: "images/sadness.png", options:["Sadness","Happiness","Fear","Disgust"], answer: 0, explanation: "Downturned mouth corners and lowered gaze indicate sadness." }
];

// State
let section = "intro";
let theoryIndex = 0;
let practicalIndex = 0;
let theoryScore = 0;
let practicalScore = 0;
let practiceDisplayTime = 2000;

// Elements
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
const startAll = document.getElementById('startAll');
const difficulty = document.getElementById('difficulty');
const theoryContainer = document.getElementById('theory-container');
const theoryFeedback = document.getElementById('theory-feedback');
const theoryNext = document.getElementById('theory-next');
const theoryScoreEl = document.getElementById('theory-score');
const theoryProgressFill = document.querySelector('#theory-progress .progress-fill');

const practicalContainer = document.getElementById('practical-container');
const practicalFeedback = document.getElementById('practical-feedback');
const practicalNext = document.getElementById('practical-next');
const practicalScoreEl = document.getElementById('practical-score');
const practiceDifficulty = document.getElementById('practice-difficulty') || document.getElementById('practice-difficulty'); // fallback
const practicalProgressFill = document.querySelector('#practical-progress .progress-fill');
const bestScoreEl = document.getElementById('best-score');

const resultModal = document.getElementById('resultModal');
const finalSummary = document.getElementById('final-summary');
const finalEval = document.getElementById('final-eval');
const restartAll = document.getElementById('restartAll');
const closeModal = document.getElementById('closeModal');

// Navigation clicks
navBtns.forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    const s = e.target.dataset.section;
    gotoSection(s);
  });
});

function gotoSection(name){
  section = name;
  sections.forEach(sec=>{
    if(sec.id === name) sec.classList.add('active'); else sec.classList.remove('active');
  });
  navBtns.forEach(b=> b.classList.toggle('active', b.dataset.section === name));
}

// START full test
startAll.addEventListener('click', ()=>{
  // set practice display time from top select
  const sel = document.getElementById('difficulty');
  practiceDisplayTime = parseInt(sel.value);
  // reset scores and indices
  theoryIndex = 0; practicalIndex = 0; theoryScore = 0; practicalScore = 0;
  updateTheoryScore(); updatePracticalScore();
  gotoSection('theory');
  renderTheory();
});

// THEORY flow
function renderTheory(){
  const q = theoryQuestions[theoryIndex];
  theoryContainer.innerHTML = `<h3>Question ${theoryIndex+1} / ${theoryQuestions.length}</h3>
    <p class="qtext">${q.q}</p>
    <div class="options"></div>`;
  const opts = theoryContainer.querySelector('.options');
  q.options.forEach((opt,i)=>{
    const b = document.createElement('button');
    b.textContent = opt;
    b.onclick = ()=>answerTheory(i);
    opts.appendChild(b);
  });
  theoryFeedback.innerHTML = '';
  theoryNext.classList.add('hidden');
  // progress
  const pct = Math.round((theoryIndex/theoryQuestions.length)*100);
  theoryProgressFill.style.width = pct + '%';
}

function answerTheory(i){
  const q = theoryQuestions[theoryIndex];
  const btns = theoryContainer.querySelectorAll('.options button');
  btns.forEach((b,idx)=>{
    b.disabled=true;
    if(idx === q.answer) b.classList.add('correct');
    if(idx === i && idx !== q.answer) b.classList.add('wrong');
  });
  if(i === q.answer){
    theoryFeedback.innerHTML = `✅ Correct — ${q.explanation}`;
    theoryScore++;
    updateTheoryScore();
  } else {
    theoryFeedback.innerHTML = `❌ Wrong — Correct is: <strong>${q.options[q.answer]}</strong><br>${q.explanation}`;
  }
  theoryNext.classList.remove('hidden');
}

theoryNext.addEventListener('click', ()=>{
  theoryIndex++;
  if(theoryIndex < theoryQuestions.length){
    renderTheory();
  } else {
    // move to practical
    gotoSection('practical');
    renderPractical();
  }
});

function updateTheoryScore(){
  theoryScoreEl.textContent = `Score: ${theoryScore}`;
}

// PRACTICAL flow
let hideTimer = null;
function renderPractical(){
  // set practice time from practice selector if exists
  const selP = document.getElementById('practice-difficulty');
  practiceDisplayTime = selP ? parseInt(selP.value) : practiceDisplayTime;
  const q = practicalQuestions[practicalIndex];
  practicalContainer.innerHTML = `<h3>Image ${practicalIndex+1} / ${practicalQuestions.length}</h3>
    <img src="${q.img}" alt="expression" class="expression">`;
  practicalFeedback.innerHTML = '';
  practicalNext.classList.add('hidden');
  // hide options until time passes
  hideTimer = setTimeout(()=>{
    showPracticalOptions(q);
  }, practiceDisplayTime);
  const pct = Math.round((practicalIndex/practicalQuestions.length)*100);
  practicalProgressFill.style.width = pct + '%';
}

function showPracticalOptions(q){
  const optsDiv = document.createElement('div');
  optsDiv.className = 'options';
  q.options.forEach((opt,i)=>{
    const b = document.createElement('button');
    b.textContent = opt;
    b.onclick = ()=>answerPractical(opt);
    optsDiv.appendChild(b);
  });
  practicalContainer.appendChild(optsDiv);
}

function answerPractical(selection){
  clearTimeout(hideTimer);
  const q = practicalQuestions[practicalIndex];
  // highlight
  const btns = practicalContainer.querySelectorAll('.options button');
  btns.forEach(b=>{
    b.disabled = true;
    if(b.textContent === q.options[q.answer]) b.classList.add('correct');
    if(b.textContent === selection && selection !== q.options[q.answer]) b.classList.add('wrong');
  });
  if(selection === q.options[q.answer]){
    practicalFeedback.innerHTML = `✅ Correct — ${q.explanation}`;
    practicalScore++;
    updatePracticalScore();
  } else {
    practicalFeedback.innerHTML = `❌ Wrong — Correct: <strong>${q.options[q.answer]}</strong><br>${q.explanation}`;
  }
  practicalNext.classList.remove('hidden');
}

practicalNext.addEventListener('click', ()=>{
  practicalIndex++;
  if(practicalIndex < practicalQuestions.length){
    renderPractical();
  } else {
    // finish — show final summary
    showFinal();
  }
});

function updatePracticalScore(){
  practicalScoreEl.textContent = `Score: ${practicalScore}`;
  // save best in localStorage (based on total)
  const total = theoryScore + practicalScore;
  const prev = parseInt(localStorage.getItem('bestScore')||'0');
  if(total > prev) {
    localStorage.setItem('bestScore', total);
    bestScoreEl.textContent = total;
  } else {
    bestScoreEl.textContent = prev;
  }
}

// Final result
function showFinal(){
  const totalQuestions = theoryQuestions.length + practicalQuestions.length;
  const totalScore = theoryScore + practicalScore;
  let evalText = '';
  const pct = Math.round((totalScore/totalQuestions)*100);
  if(pct >= 85) evalText = "Excellent — Highly perceptive";
  else if(pct >= 60) evalText = "Good — Keep training";
  else evalText = "Needs more practice — try METT exercises";

  finalSummary.innerText = `You scored ${totalScore} / ${totalQuestions} (${pct}%).`;
  finalEval.innerText = evalText;
  resultModal.classList.remove('hidden');
  gotoSection('training');
}

// restart
restartAll.addEventListener('click', ()=>{
  resultModal.classList.add('hidden');
  // reset
  theoryIndex = 0; practicalIndex = 0; theoryScore = 0; practicalScore = 0;
  updateTheoryScore(); updatePracticalScore();
  gotoSection('intro');
});
closeModal.addEventListener('click', ()=> resultModal.classList.add('hidden'));

// init
(function init(){
  // set best score display
  const best = parseInt(localStorage.getItem('bestScore')||'0');
  bestScoreEl.textContent = best;
  // wire up nav starting state
  gotoSection('intro');
})();
