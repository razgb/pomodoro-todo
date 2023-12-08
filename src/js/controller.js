import view from "./views/view.js";
import displayView from "./views/displayView.js";
import tasksView from "./views/tasksView.js";
import menuView from "./views/menuView.js";

const mainView = new view();
mainView.loadAppAnimation();

// setTimeout(() => {
//   document.addEventListener("visibilitychange", checkVisibility);
//   console.log("added visibility listener");
// }, 3000);

const init = function () {
  // mainView.resetUserPreferences(); // run this in emergencies.
  mainView.loadUserPreferences();
  mainView.addAudioForButtons(); 

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
