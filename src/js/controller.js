import view from "./views/view.js";
import displayView from "./views/displayView.js";
import tasksView from "./views/tasksView.js";
import menuView from "./views/menuView.js";

const mainView = new view();
mainView.loadAppAnimation();
// mainView.resetUserPreferences(); // run this in emergencies.

const init = function () {
  mainView.loadUserPreferences();
  mainView.screenChangeHandler();
  mainView.addAudioForButtons();
  mainView.notificationPermissionHandler();

  displayView.addModeButtonsHandler();
  displayView.addStartButtonHandler();

  tasksView.addTaskContainerHandler();
  tasksView.addTaskFormHandler();

  menuView.addMenuSliderHandler();
  menuView.addMenuConfigHandler();
  menuView.addMenuSettingsHandler();
  menuView.addMenuThemeHandler();
};

init();
