import * as update from "./js/update.js";
import * as setup from "./js/setup.js";
import * as helpers from "./js/helpers.js";

const quiz_questions_select = document.querySelector("#quiz_questions_select");
const quiz_questions_input = document.querySelector("#quiz_questions_input");
const start_game_btn = document.querySelector("#start_game_btn");
const question = document.querySelector(".question");
const answers = document.querySelector(".answers");
const home_play_btn = document.querySelector("#home_play_btn");
const home_settings_btn = document.querySelector("#home_settings_btn");
const selection_exit_btn = document.querySelector("#selection_exit_btn");
const selection_setttings_btn = document.querySelector("#selection_setttings_btn");
const settings_home_btn = document.querySelector("#settings_home_btn");
const settings_selection_btn = document.querySelector("#settings_selection_btn");
const game_home_btn = document.querySelector("#game_home_btn");
const game_selection_btn = document.querySelector("#game_selection_btn");
const theme_switch = document.querySelector("#theme_switch");
const colors = document.querySelectorAll(".color");
const game_difficulty_select = document.querySelector("#game_difficulty_select");
const timer_switch = document.querySelector("#timer_switch");
const timer_elm = document.querySelector("#timer");
const skip_btn_switch = document.querySelector("#skip_btn_switch");
const question_skip_btn = document.querySelector("#question_skip_btn");
const reveal_answers_switch = document.querySelector("#reveal_answers_switch");
const settings_reset_btn = document.querySelector("#settings_reset_btn");
const message_elm = document.querySelector(".message");

const game_state = {
  current_page: "home",
  questions_field: null,
  questions_list: [],
  current_question: 1,
  random_question: null,
  questions_count: null,
  random_questions: [0],
  score: 0,
  high_score: localStorage.getItem("high-score") ? JSON.parse(localStorage.getItem("high-score")) : 0,
  health: 4,
  timer: 15,
  difficulty: localStorage.getItem("difficulty") || "easy",
  show_mistake_colors: false,
  play_timer_interval: 0,
  question_animation_interval: 0,
  question_skip_times: 0,
  status_message: "game-start",
};

const game_settings = {
  dark_mode_enabled: localStorage.getItem("dark-mode") ? JSON.parse(localStorage.getItem("dark-mode")) : false,
  preferred_color: localStorage.getItem("preferred-color") || "color-purple",
  supported_colors: ["color-purple", "color-green", "color-blue", "color-pink", "color-red"],
  timer_enabled: localStorage.getItem("timer-enabled") ? JSON.parse(localStorage.getItem("timer-enabled")) : true,
  skip_btn_enabled: localStorage.getItem("skip-btn-enabled")
    ? JSON.parse(localStorage.getItem("skip-btn-enabled"))
    : false,
  reveal_answers_enabled: localStorage.getItem("reveal-answers-enabled")
    ? JSON.parse(localStorage.getItem("reveal-answers-enabled"))
    : true,
};

window.addEventListener("load", () => {
  update.updateGamePage(game_state);
  update.updateCurrentQuestionElm(game_state);
  update.updateQuestionsCountElm(game_state);
  update.updateScoreElm(game_state);
  update.updateHighScoreElm(game_state);
  update.updateHealthElm(game_state);
  update.updateTimerElm(game_state);
  updateGameTheme();
  getStoredColorPreference();
  getStoredDifficulty();
  updateGameTimer();
  updateQuestionSkipBtn();
  updateRevealAnswers();
});

home_play_btn.addEventListener("click", () => changeGamePage("selection"));

home_settings_btn.addEventListener("click", () => changeGamePage("settings"));

selection_exit_btn.addEventListener("click", () => changeGamePage("home"));

selection_setttings_btn.addEventListener("click", () => changeGamePage("settings"));

settings_selection_btn.addEventListener("click", () => changeGamePage("selection"));

settings_home_btn.addEventListener("click", () => changeGamePage("home"));

game_selection_btn.addEventListener("click", () => {
  changeGamePage("selection");

  resetGame();
});

game_home_btn.addEventListener("click", () => {
  changeGamePage("home");

  resetGame();
});

start_game_btn.addEventListener("click", startGame);

theme_switch.addEventListener("change", handleThemeSwitchChange);

colors.forEach((color) => color.addEventListener("click", handleColorClick));

game_difficulty_select.addEventListener("change", (e) => changeDifficulty(e.target.value));

timer_switch.addEventListener("change", handleTimerSwitchChange);

skip_btn_switch.addEventListener("change", handleSkipBtnSwitchChange);

question_skip_btn.addEventListener("click", skipQuestion);

reveal_answers_switch.addEventListener("change", handleRevealAnswersSwitchChange);

settings_reset_btn.addEventListener("click", resetGameSettings);

function startGame() {
  changeGamePage("game");

  changeStatusMessage("game-start");

  game_state.questions_field = quiz_questions_select.value;

  setup.setupQuestionsList(game_state);

  handleQuestionsCount();

  setup.setupTimerDifficulty(game_state);

  setup.setupHealthDifficulty(game_state);

  animateQuestionText();

  updateAnswers();

  handlePlayTimer();
}

function updateAnswers() {
  answers.textContent = "";

  for (const option of game_state.questions_list[game_state.random_question].options) {
    const answer_btn = createAnswerButton(option);

    answers.appendChild(answer_btn);
  }
}

function createAnswerButton(option) {
  const answer_btn = document.createElement("button");

  answer_btn.textContent = option;

  answer_btn.dataset.content = option;

  if (game_state.show_mistake_colors) {
    answer_btn.setAttribute("disabled", true);

    if (game_settings.reveal_answers_enabled) {
      answer_btn.classList.add(isCorrectAnswer(answer_btn) ? "correct" : "wrong");
    }
  }

  answer_btn.addEventListener("click", () => {
    if (isCorrectAnswer(answer_btn)) {
      handlePlayResult();
    } else handleWrongAnswer();
  });

  return answer_btn;
}

function handlePlayTimer() {
  if (!game_settings.timer_enabled) {
    timer_elm.textContent = "∞";

    return;
  }

  clearInterval(game_state.play_timer_interval);

  setup.setupTimerDifficulty(game_state);

  game_state.play_timer_interval = setInterval(() => {
    if (game_state.timer > 0) {
      game_state.timer--;

      update.updateTimerElm(game_state);
    }

    if (game_state.timer === 0) {
      clearInterval(game_state.play_timer_interval);

      handleWrongAnswer();
    }
  }, 1000);
}

function isCorrectAnswer(answer_btn) {
  return answer_btn.dataset.content === game_state.questions_list[game_state.random_question].correctAnswer;
}

function handleQuestionsCount() {
  const input_value = parseInt(quiz_questions_input.value);

  if (isNaN(input_value)) {
    game_state.questions_count = 5;

    update.updateQuestionsCountElm(game_state);

    return;
  }

  if (input_value <= 0 || input_value > 10) {
    game_state.questions_count = 5;

    update.updateQuestionsCountElm(game_state);

    return;
  }

  game_state.questions_count = input_value;

  update.updateQuestionsCountElm(game_state);
}

function handleGameScores() {
  game_state.score += Math.floor(Math.random() * 3) + 1;

  update.updateScoreElm(game_state);

  if (game_state.score >= game_state.high_score) {
    game_state.high_score = game_state.score;

    localStorage.setItem("high-score", JSON.stringify(game_state.high_score));

    update.updateHighScoreElm(game_state);
  }
}

function handlePlayResult() {
  const { current_question, questions_count } = game_state;

  if (current_question < questions_count) {
    handleCorrectAnswer();

    return;
  }

  gameWon();
}

function nextQuestion() {
  helpers.shuffleArray(game_state.questions_list);

  helpers.shuffleArray(game_state.questions_list[game_state.random_question].options);

  animateQuestionText();

  game_state.current_question++;

  update.updateCurrentQuestionElm(game_state);

  updateAnswers();

  handlePlayTimer();
}

function setMistakeRules() {
  game_state.health--;

  update.updateHealthElm(game_state);

  if (game_state.score > 0) {
    game_state.score--;

    update.updateScoreElm(game_state);
  }
}

function handleCorrectAnswer() {
  changeStatusMessage("correct-answer");

  nextQuestion();

  handleGameScores();
}

function handleWrongAnswer() {
  if (game_state.health === 1) {
    answers.textContent = "";

    setMistakeRules();

    showMistakeColors();

    setTimeout(gameOver, 1000);

    return;
  }

  if (game_state.current_question === game_state.questions_count) {
    showMistakeColors();

    answers.textContent = "";

    setTimeout(gameOver, 1000);

    return;
  }

  changeStatusMessage("wrong-answer");

  showMistakeColors();

  setTimeout(() => {
    nextQuestion();

    setMistakeRules();
  }, 1000);
}

function showMistakeColors() {
  game_state.show_mistake_colors = true;

  updateAnswers();

  setTimeout(() => {
    game_state.show_mistake_colors = false;

    updateAnswers();
  }, 1000);
}

function gameOver() {
  changeGamePage("selection", game_state);

  resetGame();
}

function gameWon() {
  answers.textContent = "";

  handleGameScores();

  setTimeout(gameOver, 1000);
}

function resetGame() {
  question.textContent = "";

  game_state.questions_field = "random";

  game_state.current_question = 1;

  update.updateCurrentQuestionElm(game_state);

  game_state.score = 0;

  update.updateScoreElm(game_state);

  clearInterval(game_state.play_timer_interval);

  clearInterval(game_state.question_animation_interval);
}

function changeGamePage(page) {
  game_state.current_page = page;

  update.updateGamePage(game_state);

  return page;
}

function updateGameTheme() {
  theme_switch.checked = game_settings.dark_mode_enabled;

  if (game_settings.dark_mode_enabled) document.body.classList.add("dark");
  else document.body.classList.remove("dark");
}

function handleThemeSwitchChange() {
  game_settings.dark_mode_enabled = theme_switch.checked;

  updateGameTheme();

  localStorage.setItem("dark-mode", JSON.stringify(game_settings.dark_mode_enabled));
}

function handleColorClick(e) {
  game_settings.preferred_color = e.target.dataset.color;

  localStorage.setItem("preferred-color", game_settings.preferred_color);

  applyPreferredColorScheme(e.target.dataset.color);

  colors.forEach((color) => color.classList.remove("active"));

  e.target.classList.add("active");
}

function applyPreferredColorScheme(value) {
  for (const supported_color of game_settings.supported_colors) {
    document.body.classList.remove(supported_color);
  }

  document.body.classList.add(value);
}

function getStoredColorPreference() {
  applyPreferredColorScheme(game_settings.preferred_color);

  colors.forEach((color) => {
    color.classList.remove("active");

    if (color.dataset.color === game_settings.preferred_color) color.classList.add("active");
  });
}

function animateQuestionText() {
  game_state.random_question = Math.floor(Math.random() * game_state.questions_list.length);

  const current_question = game_state.questions_list[game_state.random_question].question;

  let current_index = 0;

  clearInterval(game_state.question_animation_interval);

  game_state.question_animation_interval = setInterval(() => {
    question.textContent = current_question.slice(0, current_index + 1);

    current_index++;

    if (current_index === current_question.length) clearInterval(game_state.question_animation_interval);
  }, 50);
}

function changeDifficulty(difficulty) {
  game_state.difficulty = difficulty;

  localStorage.setItem("difficulty", game_state.difficulty);

  return difficulty;
}

function getStoredDifficulty() {
  game_difficulty_select.value = game_state.difficulty;
}

function updateGameTimer() {
  timer_switch.checked = game_settings.timer_enabled;
}

function handleTimerSwitchChange() {
  game_settings.timer_enabled = timer_switch.checked;

  updateGameTimer();

  localStorage.setItem("timer-enabled", JSON.stringify(game_settings.timer_enabled));
}

function updateQuestionSkipBtn() {
  skip_btn_switch.checked = game_settings.skip_btn_enabled;

  if (game_settings.skip_btn_enabled) question_skip_btn.classList.remove("hide");
  else question_skip_btn.classList.add("hide");
}

function handleSkipBtnSwitchChange() {
  game_settings.skip_btn_enabled = skip_btn_switch.checked;

  updateQuestionSkipBtn();

  localStorage.setItem("skip-btn-enabled", JSON.stringify(game_settings.skip_btn_enabled));
}

function skipQuestion() {
  if (game_state.current_question === game_state.questions_count) {
    answers.textContent = "";

    setTimeout(gameOver, 1000);

    return;
  }

  game_state.question_skip_times++;

  if (game_state.health > 0) {
    changeStatusMessage("skip");

    nextQuestion();
  }

  if (game_state.question_skip_times === 2) {
    game_state.health--;

    update.updateHealthElm(game_state);

    if (game_state.health === 0) {
      answers.textContent = "";

      setTimeout(gameOver, 1000);
    }

    game_state.question_skip_times = 0;
  }
}

function updateRevealAnswers() {
  reveal_answers_switch.checked = game_settings.reveal_answers_enabled;
}

function handleRevealAnswersSwitchChange() {
  game_settings.reveal_answers_enabled = reveal_answers_switch.checked;

  updateRevealAnswers();

  localStorage.setItem("reveal-answers-enabled", JSON.stringify(game_settings.reveal_answers_enabled));
}

function resetGameSettings() {
  game_state.difficulty = "easy";

  localStorage.setItem("difficulty", game_state.difficulty);

  getStoredDifficulty();

  game_settings.dark_mode_enabled = false;

  localStorage.setItem("dark-mode", JSON.stringify(game_settings.dark_mode_enabled));

  updateGameTheme();

  game_settings.preferred_color = "color-purple";

  localStorage.setItem("preferred-color", game_settings.preferred_color);

  getStoredColorPreference();

  game_settings.timer_enabled = true;

  localStorage.setItem("timer-enabled", JSON.stringify(game_settings.timer_enabled));

  updateGameTimer();

  game_settings.skip_btn_enabled = false;

  localStorage.setItem("skip-btn-enabled", JSON.stringify(game_settings.skip_btn_enabled));

  updateQuestionSkipBtn();

  game_settings.reveal_answers_enabled = true;

  localStorage.setItem("reveal-answers-enabled", JSON.stringify(game_settings.reveal_answers_enabled));

  updateRevealAnswers();
}

function changeStatusMessage(status) {
  switch (status) {
    case "game-start":
      message_elm.textContent = "Begin the game by pressing any of the buttons above. Enjoy and good luck!";
      break;

    case "correct-answer":
      message_elm.textContent = "Well done! Your answer is correct. Great job!";
      break;

    case "wrong-answer":
      message_elm.textContent = "Unfortunately, your answer is incorrect. Please try again.";
      break;

    case "skip":
      message_elm.textContent = `You have skipped ${game_state.question_skip_times} question${
        game_state.question_skip_times > 1 ? "s" : ""
      }.`;
      break;

    default:
      message_elm.textContent = "Begin the game by pressing any of the buttons above. Enjoy and good luck!";
  }
}
