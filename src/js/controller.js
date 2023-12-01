import view from "./views/view.js";

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
