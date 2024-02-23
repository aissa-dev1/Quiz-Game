const quiz_home_page = document.querySelector(".quiz-home-page");
const quiz_selection_page = document.querySelector(".quiz-selection-page");
const quiz_game_page = document.querySelector(".quiz-game-page");
const quiz_settings_page = document.querySelector(".quiz-settings-page");
const pages = document.querySelectorAll(".page");
const current_question_elm = document.querySelector("#current_question");
const questions_count_elm = document.querySelector("#questions_count");
const score_elm = document.querySelector("#score");
const high_score_elm = document.querySelector("#high_score");
const health_elm = document.querySelector("#health");
const timer_elm = document.querySelector("#timer");

export function updateGamePage(game_state) {
  switch (game_state.current_page) {
    case "home":
      pages.forEach((page) => page.classList.add("hide"));
      quiz_home_page.classList.remove("hide");
      break;

    case "selection":
      pages.forEach((page) => page.classList.add("hide"));
      quiz_selection_page.classList.remove("hide");
      break;

    case "game":
      pages.forEach((page) => page.classList.add("hide"));
      quiz_game_page.classList.remove("hide");
      break;

    case "settings":
      pages.forEach((page) => page.classList.add("hide"));
      quiz_settings_page.classList.remove("hide");
      break;

    default:
      pages.forEach((page) => page.classList.add("hide"));
      quiz_home_page.classList.remove("hide");
  }
}

export function updateCurrentQuestionElm(game_state) {
  current_question_elm.textContent = `${game_state.current_question}`;
}

export function updateQuestionsCountElm(game_state) {
  questions_count_elm.textContent = `${game_state.questions_count}`;
}

export function updateScoreElm(game_state) {
  score_elm.textContent = `${game_state.score}`;
}

export function updateHighScoreElm(game_state) {
  high_score_elm.textContent = `${game_state.high_score}`;
}

export function updateHealthElm(game_state) {
  health_elm.textContent = `${game_state.health}`;
}

export function updateTimerElm(game_state) {
  timer_elm.textContent = `${game_state.timer}`;
}
