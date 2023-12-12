import view from "./view.js";

class menuView extends view {
  addMenuSliderHandler() {
    const menuButton = document.querySelector(".menu__hamburger");
    menuButton.addEventListener("click", function () {
      const menu = document.querySelector(".menu");
      const app = document.querySelector(".app");
      const topMenuCover = document.querySelector(".menu__container-cover");

      if (!view._menuState) {
        menu.style.transform = "translateX(0)";
        app.style.marginLeft = "20%";
        view._menuState = true;
        setTimeout(() => topMenuCover.classList.remove("hidden"), 300);
      } else {
        menu.style.transform = "translateX(-110%)";
        app.style.marginLeft = "0";
        view._menuState = false;
        topMenuCover.classList.add("hidden");
      }
    });

    const menuContainer = document.querySelector(".menu__container");
    menuContainer.addEventListener("click", (e) => {
      const menuTab = e.target.closest(".button-md"); // e.g. settings, theme, config, analytics
      if (!menuTab) return;
      const menuIcon = menuTab.querySelector(".icon");
      if (!menuIcon) return;

      // Might change this into an animation by editing only the down class with transitions
      menuIcon.classList.toggle("open");

      // Elements that collapse once button is clicked.
      const menuContent =
        menuTab.parentElement.querySelector(".menu__subbuttons");
      menuContent.classList.toggle("hidden");

      // Selecting respective 'feature-box' container to add/remove margin.
      const featureBox = menuContent.parentElement;
      if (!menuContent.classList.contains("hidden")) {
        featureBox.style.marginBottom = "4.8rem";
      } else featureBox.style.marginBottom = "0";
    });
  }

  addMenuSettingsHandler() {
    const settingsContainer = document.querySelector(".settings-box");
    settingsContainer.addEventListener("click", (e) => {
      const icon = e.target.closest(".task__check")?.querySelector(".icon"); // this is the empty box's icon .
      if (!icon) return;

      const feature = icon
        .closest(".menu__subbuttons-content")
        .querySelector(".menu__heading");

      const featureName = feature.textContent;

      // Only one executes.
      const manageFeature = (boolean) => {
        if (featureName === "Loop pomo & break") view._autoStartPomo = boolean;
        if (featureName === "Remove tasks") view._removeTasks = boolean;
        if (featureName === "Button sounds") view._buttonSounds = boolean;
        if (featureName === "Allow notifications")
          view._notificationsState = boolean;
      };

      if (icon.classList.contains("completed")) {
        icon.classList.remove("completed"); // unticks a ticked box.
        manageFeature(false);
      } else {
        icon.classList.add("completed"); // ticks an unticked box.
        manageFeature(true);
      }

      if (view._removeTasks) {
        document.querySelector(".tasks").classList.add("hidden");
      } else {
        document.querySelector(".tasks").classList.remove("hidden");
      }

      if (view._notificationsState) {
        this._requestNotifications();
      }

      this._saveUserPreferences();

      /* (info) To check how code works
      console.log(
        view._autoStartPomo,
        view._removeTasks,
        view._buttonSounds,
        view._notificationsState
      );
       */
    });
  }

  addMenuThemeHandler() {
    const themeContainer = document.querySelector(".theme-box");

    themeContainer.addEventListener("click", (e) => {
      // CUSTOM VERSION OF addMenuTickCheckHandler()
      const icon = e.target.closest(".task__check")?.querySelector(".icon"); // this is the empty box's icon .
      if (!icon) return;

      themeContainer
        .querySelectorAll(".icon")
        .forEach((icon) => icon.classList.remove("completed"));

      if (icon.classList.contains("completed")) {
        icon.classList.remove("completed"); // unticks a ticked box.
      } else {
        icon.classList.add("completed"); // ticks an unticked box.
      }

      // parent is the button containing icon => sibling is .menu__heading
      const theme = icon.parentElement.previousElementSibling.textContent;

      if (theme === "Default") {
        if (theme === view._currentTheme) return; // do nothing
        document.body.className = "";
        view._currentTheme = "Default";
      }
      if (theme === "Mocha") {
        if (theme === view._currentTheme) return; // do nothing
        document.body.className = "";
        document.body.classList.add("mocha");
        view._currentTheme = "Mocha";
      }
      if (theme === "Aqua") {
        if (theme === view._currentTheme) return; // do nothing
        document.body.className = "";
        document.body.classList.add("aqua");
        view._currentTheme = "Aqua";
      }
      if (theme === "Night") {
        if (theme === view._currentTheme) return; // do nothing
        document.body.className = "";
        document.body.classList.add("night");
        view._currentTheme = "Night";
      }
      if (theme === "Light") {
        if (theme === view._currentTheme) return; // do nothing
        document.body.className = "";
        document.body.classList.add("light");
        view._currentTheme = "Light";
      }

      this._saveUserPreferences();
    });
  }

  addMenuConfigHandler() {
    const resetModeToPomo = function () {
      const modeButtons = document.querySelector(".display__buttons");
      modeButtons
        .querySelectorAll(".button-lg")
        .forEach((button) => button.classList.remove("mode-active"));

      document.querySelector(".btn-pomo").classList.add("mode-active");
    };

    const inputCheck = (userTimeInput) => {
      if (
        userTimeInput === "" ||
        !Number.isInteger(Number(userTimeInput)) ||
        userTimeInput[0] === "0" ||
        userTimeInput.includes(" ")
      ) {
        return false;
      }

      // if the function passes all checks
      return true;
    };

    const applyConfig = document.querySelector(".apply-config");
    const configBox = document.querySelector(".config-box");

    const configHandler = (e) => {
      if (e.type !== "click" && e.key !== "Enter" && e.keyCode !== 13) return;

      view._timerON = false;
      view._display.textContent = `${view._timePomo
        .toString()
        .padStart(2, "0")}:00`;
      resetModeToPomo();
      view._startButton.textContent = "START";

      const pomodoroInput = document.querySelector(".pomodoro-input");
      const shortBreakInput = document.querySelector(".short-break-input");
      const longBreakInput = document.querySelector(".long-break-input");

      // Entire app resets back to original pomodoro button state.
      if (inputCheck(pomodoroInput.value)) {
        pomodoroInput.placeholder =
          view._timeLeft =
          view._timePomo =
            pomodoroInput.value;

        pomodoroInput.value = "";

        view._display.textContent = `${view._timePomo
          .toString()
          .padStart(2, "0")}:00`;
      }
      if (inputCheck(shortBreakInput.value)) {
        shortBreakInput.placeholder = view._timeShortBreak =
          shortBreakInput.value;

        shortBreakInput.value = "";
      }
      if (inputCheck(longBreakInput.value)) {
        longBreakInput.placeholder = view._timeLongBreak = longBreakInput.value;

        longBreakInput.value = "";
      }

      this._saveUserPreferences();
    };

    applyConfig.addEventListener("click", configHandler);
    configBox.addEventListener("keydown", configHandler);
  }
}

export default new menuView();
