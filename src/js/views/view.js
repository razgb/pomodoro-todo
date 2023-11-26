class view {
  _parentContainer = "";
  _currentTheme = "Default";
  _menuState = false;

  _display = document.querySelector(".display__timer-numbers");
  _startButton = document.querySelector(".display__start-button");
  _timerON = false;
  _timeLeft = 25;

  _autoShortBreak = false;
  _autoStartPomo = false;
  _removeTasks = false;
  _buttonSounds = true;

  // default values
  _timePomo = 25;
  _timeShortBreak = 5;
  _timeLongBreak = 15;

  _clear() {
    this._parentContainer.innerHTML = "";
  }

  // THIS FUNCTION IS RUN BY THE addModeHandler FUNCTION!!!
  addStartButtonHandler() {
    const modeButtons = document.querySelector(".display__buttons");

    // Delegates event to the container of all mode buttons.
    modeButtons.addEventListener("click", (e) => {
      const mode = e.target.closest(".button-lg");
      if (!mode) return;

      // Removes active mode (pressed down illusion).
      modeButtons
        .querySelectorAll(".button-lg")
        .forEach((button) => button.classList.remove("mode-active"));

      // adds back the illusion to the clicked mode button
      mode.classList.add("mode-active");

      // dynamically changes the timeLeft variable to fit mode's function.
      if (mode.textContent === "POMODORO") {
        this._timeLeft = this._timePomo;
        this._display.textContent = `${this._timePomo
          .toString()
          .padStart(2, "0")}:00`;
        this._timerON = false;
      }
      if (mode.textContent === "SHORT BREAK") {
        this._timeLeft = this._timeShortBreak;
        this._display.textContent = `${this._timeShortBreak
          .toString()
          .padStart(2, "0")}:00`;
        this._timerON = false;
      }
      if (mode.textContent === "LONG BREAK") {
        this._timeLeft = this._timeLongBreak;
        this._display.textContent = `${this._timeLongBreak
          .toString()
          .padStart(2, "0")}:00`;
        this._timerON = false;
      }
    });

    this._startButton.addEventListener("click", () => {
      let minutes = this._timeLeft;
      let seconds = 0;

      if (this._startButton.textContent === "START") {
        this._timerON = true; // start button has been clicked
        this._display.textContent = "START";
        setTimeout(() => (this._startButton.textContent = "RESET"), 1000);
      } else {
        this._timerON = false; // reset button has been clicked
        this._display.textContent = "RESET";
        setTimeout(() => {
          this._display.textContent = `${this._timeLeft
            .toString()
            .padStart(2, "0")}:00`;
          this._startButton.textContent = "START";
        }, 1000);
      }

      let i = 0; // used to make autoshortbreak run once.
      let timer = setInterval(() => {
        if (!this._timerON) {
          clearInterval(timer);
          this._startButton.textContent = "START";
          return;
        }

        // WHEN THE USER TURNS ON SHORT BREAK.
        if (minutes === 0 && seconds === 0 && this._autoShortBreak) {
          if (i > 0) {
            this._timerON = false;
            this._autoShortBreak = false; // edge case so 2 short breaks don't occur.
            this._display.textContent = "END";
            setTimeout(
              () =>
                (this._display.textContent = `${this._timeShortBreak
                  .toString()
                  .padStart(2, "0")}:00`),
              1000
            );
            return;
          }

          this._display.textContent = "END";

          modeButtons
            .querySelectorAll(".button-lg")
            .forEach((button) => button.classList.remove("mode-active"));

          document.querySelector(".btn-short").classList.add("mode-active");

          minutes = this._timeShortBreak;

          this._display.textContent = `${this._timeShortBreak
            .toString()
            .padStart(2, "0")}:00`;

          this._startButton.textContent = "RESET";
          i++;
        } // Timer complete.

        // WHEN TIMER ENDS AND BOTH AUTOSHORTBREAK & AUTOSTARTPOMO ARE OFF
        if (
          minutes === 0 &&
          seconds === 0 &&
          this._autoShortBreak === false &&
          this._autoStartPomo === false
        ) {
          this._timerON = false;
          this._display.textContent = "END";

          setTimeout(() => {
            this._display.textContent = `${this._timeShortBreak
              .toString()
              .padStart(2, "0")}:00`;
          }, 1000);
          return;
        } // Timer complete.

        --seconds;

        if (seconds < 0) {
          --minutes;
          seconds = 59;
        }

        this._display.textContent = `${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      }, 100);
    });
  }

  // ADDS MENU SLIDER /W ANIMATION.s
  addMenuSliderHandler() {
    const menuButton = document.querySelector(".menu__hamburger");
    menuButton.addEventListener("click", function () {
      const menu = document.querySelector(".menu");
      const app = document.querySelector(".app");

      if (!this._menuState) {
        menu.style.transform = "translateX(0)";
        app.style.marginLeft = "20%";
        this._menuState = true;
      } else {
        menu.style.transform = "translateX(-110%)";
        app.style.marginLeft = "0";
        this._menuState = false;
      }
    });

    const menuContainer = document.querySelector(".menu__container");
    menuContainer.addEventListener("click", (e) => {
      const menuTab = e.target.closest(".button-md"); // e.g. settings, theme, config, analytics
      if (!menuTab) return;

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
      // console.log(icon);

      const feature = icon
        .closest(".menu__subbuttons-content")
        .querySelector(".menu__heading");

      const featureName = feature.textContent;
      // console.log(featureName);

      const manageFeature = (boolean) => {
        if (featureName === "Auto start break") this._autoShortBreak = boolean;
        if (featureName === "Auto start pomo") this._autoStartPomo = boolean;
        if (featureName === "Remove tasks") this._removeTasks = boolean;
        if (featureName === "Button sounds") this._buttonSounds = boolean;
      };

      if (icon.classList.contains("completed")) {
        icon.classList.remove("completed"); // unticks a ticked box.
        manageFeature(false);
      } else {
        icon.classList.add("completed"); // ticks an unticked box.
        manageFeature(true);
      }

      // (info) To check how code works
      /*
      console.log(this._autoShortBreak,this._autoStartPomo,this._removeTasks,this._buttonSounds
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
        if (theme === this._currentTheme) return; // do nothing
        document.body.className = "";
        this._currentTheme = "Default";
      }
      if (theme === "Mocha") {
        if (theme === this._currentTheme) return; // do nothing
        document.body.className = "";
        document.body.classList.add("mocha");
        this._currentTheme = "Mocha";
      }
      if (theme === "Aquamarine") {
        if (theme === this._currentTheme) return; // do nothing
        document.body.className = "";
        document.body.classList.add("aquamarine");
        this._currentTheme = "Aquamarine";
      }
      if (theme === "Dark mode") {
        if (theme === this._currentTheme) return; // do nothing
        document.body.className = "";
        document.body.classList.add("dark-mode");
        this._currentTheme = "Dark";
      }
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
    applyConfig.addEventListener("click", () => {
      this.timerON = false;

      const pomodoroInput = document.querySelector(".pomodoro-input");
      const shortBreakInput = document.querySelector(".short-break-input");
      const longBreakInput = document.querySelector(".long-break-input");

      resetModeToPomo();

      // Entire app resets back to original pomodoro button state.
      if (inputCheck(pomodoroInput.value)) {
        pomodoroInput.placeholder =
          this._timeLeft =
          this._timePomo =
            pomodoroInput.value;

        pomodoroInput.value = "";
        this._timerON = false;

        this._display.textContent = `${this._timePomo
          .toString()
          .padStart(2, "0")}:00`;
      }
      if (inputCheck(shortBreakInput.value)) {
        shortBreakInput.placeholder = this._timeShortBreak =
          shortBreakInput.value;

        shortBreakInput.value = "";
        this._timerON = false;
      }
      if (inputCheck(longBreakInput.value)) {
        longBreakInput.placeholder = this._timeLongBreak = longBreakInput.value;

        longBreakInput.value = "";
        this._timerON = false;
      }
    });

    /*
      const configMode = e.target
      .closest(".menu__input")
      .parentElement.querySelector(".menu__subbuttons-heading").textContent;
      
      if (configMode === "Pomodoro") {
        if (!inputCheck()) return;
        
        this._timeLeft = this._timePomo = userTimeInput;
        this._timerON = false;
        this._display.textContent = `${userTimeInput
          .toString()
          .padStart(2, "0")}:00`;
        resetModeToPomo();
      }

      if (configMode === "Short break") {
        if (!inputCheck()) return;

        this.timeLeft = this._timeShortBreak = userTimeInput;
        this._timerON = false;
        this._display.textContent = `${this._timePomo
          .toString()
          .padStart(2, "0")}:00`;
        resetModeToPomo();
        resetModeToPomo();
      }

      if (configMode === "Long break") {
        if (!inputCheck()) return;

        this.timeLeft = this._timeLongBreak = userTimeInput;
        this._timerON = false;
        this._display.textContent = `${this._timePomo
          .toString()
          .padStart(2, "0")}:00`;
        resetModeToPomo();
        resetModeToPomo();
      }
      */
  }

  // analytics function() goes here
}

export default new view();
