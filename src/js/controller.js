import view from "./views/view.js";
import displayView from "./views/displayView.js";
import tasksView from "./views/tasksView.js";
import menuView from "./views/menuView.js";

const mainView = new view();
mainView.loadAppAnimation();

const init = function () {
  // mainView.resetUserPreferences();
  mainView.loadUserPreferences();
  displayView.addStartButtonHandler();
  displayView.addModeButtonsHandler();

  tasksView.addTaskContainerHandler();
  tasksView.addTaskFormHandler();

  menuView.addMenuSliderHandler();
  menuView.addMenuConfigHandler();
  menuView.addMenuSettingsHandler();
  menuView.addMenuThemeHandler();
};

init();
