import view from "./views/view.js";
import displayView from "./views/displayView.js";
import tasksView from "./views/tasksView.js";
import menuView from "./views/menuView.js";

const mainView = new view();
mainView.loadAppAnimation();

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

// if (window.Worker) {
//   console.log('Web Worker works.');

//   const timerWorker = new Worker('timerWorker.js'); 
//   timerWorker.onmessage = function (e) {
//     console.log(e.data);
//   }
// }
