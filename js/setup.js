import quiz_gaming from "./data/gaming.js";
import quiz_programming from "./data/programming.js";
import quiz_random from "./data/random.js";
import * as update from "./update.js";

export function setupQuestionsList(game_state) {
  switch (game_state.questions_field) {
    case "random":
      game_state.questions_list = quiz_random;
      break;

    case "gaming":
      game_state.questions_list = quiz_gaming;
      break;

    case "programming":
      game_state.questions_list = quiz_programming;
      break;

    default:
      game_state.questions_list = quiz_random;
  }
}

export function setupTimerDifficulty(game_state) {
  switch (game_state.difficulty) {
    case "easy":
      game_state.timer = 15;
      break;

    case "medium":
      game_state.timer = 12;
      break;

    case "hard":
      game_state.timer = 10;
      break;

    default:
      game_state.timer = 15;
  }

  update.updateTimerElm(game_state);
}

export function setupHealthDifficulty(game_state) {
  switch (game_state.difficulty) {
    case "easy":
      if (game_state.questions_count > 3) game_state.health = 4;
      else game_state.health = 2;
      break;

    case "medium":
      if (game_state.questions_count > 3) game_state.health = 3;
      else game_state.health = 2;
      break;

    case "hard":
      if (game_state.questions_count > 3) game_state.health = 2;
      else game_state.health = 1;
      break;

    default:
      if (game_state.questions_count > 3) game_state.health = 4;
      else game_state.health = 2;
  }

  update.updateHealthElm(game_state);
}
