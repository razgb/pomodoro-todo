import view from "./views/view.js";
// FIX THIS WHEN YOU WAKE UP PLEASE.

view.loadAppAnimation();

const init = function () {
  // In place of this comment there should be a function to load in the browser data.

  view.addMenuSliderHandler();

  view.addModeButtonsHandler();
  view.addStartButtonHandler();

  view.addMenuConfigHandler();
  view.addMenuSettingsHandler();
  view.addMenuThemeHandler();
};

init();
