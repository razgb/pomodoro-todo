import view from "./views/view.js";
// FIX THIS WHEN YOU WAKE UP PLEASE.

view.loadAppAnimation();

const init = function () {
  // view.resetUserPreferences();

  view.loadUserPreferences();

  view.addTaskContainerHandler();
  view.addTaskFormHandler();

  view.addStartButtonHandler();

  view.addMenuSliderHandler();
  view.addModeButtonsHandler();
  view.addMenuConfigHandler();
  view.addMenuSettingsHandler();
  view.addMenuThemeHandler();
};

init();
