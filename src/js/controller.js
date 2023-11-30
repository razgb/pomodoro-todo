import view from "./views/view.js";
// FIX THIS WHEN YOU WAKE UP PLEASE.

view.loadAppAnimation();

const init = function () {
  // view.resetUserPreferences();

  view.loadUserPreferences();

  view.addMenuSliderHandler();

  view.addModeButtonsHandler();
  view.addStartButtonHandler();

  view.addMenuConfigHandler();
  view.addMenuSettingsHandler();
  view.addMenuThemeHandler();
};

init();
