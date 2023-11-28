class view {
  _parentContainer = "";
  _currentTheme = "Default";
  _menuState = false;

  _display = document.querySelector(".display__timer-numbers");
  _startButton = document.querySelector(".display__start-button");
  _timerON = false;
  _timeLeft = 25;

  _autoStartPomo = true;
  _removeTasks = false;
  _buttonSounds = true;

  // default values
  _timePomo = 25;
  _timeShortBreak = 5;
  _timeLongBreak = 15;

  // testing values:
  // _timePomo = 1;
  // _timeShortBreak = 1;
  // _timeLongBreak = 15;

  _clear() {
    this._parentContainer.innerHTML = "";
  }

  loadAppAnimation() {
    const loadingContainer = document.querySelector(".loading-app");
    const loadingHeading = document.querySelector(".loading-app__heading");

    // Akar's recommendation: make a flex box that contains the loading text + '...' that are seperate.

    let i = 0;
    const removeAddDots = () => {
      let loading = setInterval(() => {
        if (i === 4) {
          i = 0;
          loadingHeading.textContent = "Loading"; // 3 intentional spaces.
        }

        if (i !== 0) {
          loadingHeading.textContent = loadingHeading.textContent + ".";
        }

        i++;
      }, 150);

      const splitHeading = loadingHeading.textContent.split("");
      const indexOfFirstBlank = splitHeading.indexOf(" ");
      splitHeading[indexOfFirstBlank] = ".";
      loadingHeading.textContent = splitHeading.join("");
      setTimeout(() => clearInterval(loading), 2000);
    };
    removeAddDots();

    setTimeout(() => {
      loadingContainer.classList.add("loading-hidden");
    }, 2000);
  }

  // Changes pomodoro modes
  addModeButtonsHandler() {
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
        this._startButton.textContent = "START";
        this._timerON = false;
      }
      if (mode.textContent === "SHORT BREAK") {
        this._timeLeft = this._timeShortBreak;
        this._display.textContent = `${this._timeShortBreak
          .toString()
          .padStart(2, "0")}:00`;
        this._startButton.textContent = "START";
        this._timerON = false;
      }
      if (mode.textContent === "LONG BREAK") {
        this._timeLeft = this._timeLongBreak;
        this._display.textContent = `${this._timeLongBreak
          .toString()
          .padStart(2, "0")}:00`;
        this._startButton.textContent = "START";
        this._timerON = false;
      }
    });
  }

  // App works based of start button.
  addStartButtonHandler() {
    const modeButtons = document.querySelector(".display__buttons");

    // EVENT LISTENER
    this._startButton.addEventListener("click", () => {
      let minutes = this._timeLeft;
      let seconds = 0;
      const switchModeTo = function (mode) {
        // (info) mode name as a string.
        modeButtons
          .querySelectorAll(".button-lg")
          .forEach((button) => button.classList.remove("mode-active"));
        document.querySelector(`.btn-${mode}`).classList.add("mode-active");
      };

      if (this._startButton.textContent === "START") {
        this._timerON = true; // start button has been clicked
        this._display.textContent = "START";
        this._startButton.textContent = "RESET";
        // setTimeout(() => (this._startButton.textContent = "RESET"), 1000);
      } else {
        this._timerON = false; // reset button has been clicked
        this._display.textContent = "RESET";
        switchModeTo("pomo");
        setTimeout(() => {
          this._display.textContent = `${this._timeLeft
            .toString()
            .padStart(2, "0")}:00`;
          this._startButton.textContent = "START";
        }, 1000);
      }

      // Has to be defined afer determining what the start button is.
      const startingMode = document.querySelector(".mode-active").textContent;

      let i = 0; // used to make the infinite loop run once fully every interval.
      let currentMode = startingMode;

      let timer = setInterval(() => {
        if (!this._timerON && this._startButton.textContent !== "RESET") {
          clearInterval(timer);
          return;
        }

        if (minutes === 0 && seconds === 0 && this._autoStartPomo && i < 1) {
          i++;
          this._timerON = false;
          this._display.textContent = "END";

          let messageIndex = 0;
          setTimeout(() => {
            // prettier-ignore
            const messages = [`${currentMode === "POMODORO" ? "SHORT" : "POMO"}`, `${currentMode === "POMODORO" ? "BREAK" : "DORO"}`,"IN","3","2","1"];

            let timerMessage = setInterval(() => {
              this._display.textContent = messages[messageIndex];
              messageIndex++;
              if (messageIndex > 5) {
                clearInterval(timerMessage);
                return;
              }
            }, 500); // in total 3000
          }, 1000);

          setTimeout(() => {
            // Else if used so only ONE if {} block runs.
            if (currentMode === "POMODORO") {
              this._timerON = true;
              switchModeTo("short");
              minutes = this._timeShortBreak;
              currentMode = "SHORT BREAK";
              this._display.textContent = `${this._timeShortBreak
                .toString()
                .padStart(2, "0")}:00`;
              i = 0;
              return;
            } else if (currentMode === "SHORT BREAK") {
              this._timerON = true;
              switchModeTo("pomo");
              minutes = this._timePomo;
              currentMode = "POMODORO";
              this._display.textContent = `${this._timePomo
                .toString()
                .padStart(2, "0")}:00`;
              i = 0;
              return;
            }
          }, 4500); // 1000 + 3000 + on purpose 500 to make the last second show nicely.
        }

        //

        if (minutes === 0 && seconds === 0 && this._autoStartPomo === false) {
          this._timerON = false;
          this._display.textContent = "END";

          setTimeout(() => {
            this._display.textContent = `${this._timeShortBreak
              .toString()
              .padStart(2, "0")}:00`;
            this._startButton.textContent = "START";
          }, 1000);
          return;
        } // Timer complete.

        // Needed for the infinite timer loop feature
        if (!this._timerON || i >= 1) return;

        --seconds;

        if (seconds < 0) {
          --minutes;
          seconds = 59;
        }

        this._display.textContent = `${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      }, 1000);
    });
  }

  // Adds menu slider
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
      const menuIcon = menuTab.querySelector(".icon");
      if (!menuIcon) return;

      // Might change this into an animation by editing only the down class & removing up.
      menuIcon.classList.toggle("fi-bs-angle-small-down");
      menuIcon.classList.toggle("fi-bs-angle-small-up");

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
        if (featureName === "Loop pomo & break") this._autoStartPomo = boolean;
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

      // Code to hide the tasks section for minimalism.
      if (this._removeTasks) {
        document.querySelector(".tasks").classList.add("hidden");
      } else {
        document.querySelector(".tasks").classList.remove("hidden");
      }

      this._saveUserPreferences();

      /* (info) To check how code works
      console.log(this._autoStartPomo,this._removeTasks,this._buttonSounds
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
      if (theme === "Aqua") {
        if (theme === this._currentTheme) return; // do nothing
        document.body.className = "";
        document.body.classList.add("aqua");
        this._currentTheme = "Aqua";
      }
      if (theme === "Night") {
        if (theme === this._currentTheme) return; // do nothing
        document.body.className = "";
        document.body.classList.add("night");
        this._currentTheme = "Night";
      }
      if (theme === "Light") {
        if (theme === this._currentTheme) return; // do nothing
        document.body.className = "";
        document.body.classList.add("light");
        this._currentTheme = "Light";
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
    applyConfig.addEventListener("click", () => {
      this.timerON = false;
      resetModeToPomo();

      const pomodoroInput = document.querySelector(".pomodoro-input");
      const shortBreakInput = document.querySelector(".short-break-input");
      const longBreakInput = document.querySelector(".long-break-input");

      // Entire app resets back to original pomodoro button state.
      if (inputCheck(pomodoroInput.value)) {
        pomodoroInput.placeholder =
          this._timeLeft =
          this._timePomo =
            pomodoroInput.value;

        pomodoroInput.value = "";

        this._display.textContent = `${this._timePomo
          .toString()
          .padStart(2, "0")}:00`;
      }
      if (inputCheck(shortBreakInput.value)) {
        shortBreakInput.placeholder = this._timeShortBreak =
          shortBreakInput.value;

        shortBreakInput.value = "";
      }
      if (inputCheck(longBreakInput.value)) {
        longBreakInput.placeholder = this._timeLongBreak = longBreakInput.value;

        longBreakInput.value = "";
      }

      this._saveUserPreferences();
    });
  }

  // Used at the end of each settings handler to save user settings.
  _saveUserPreferences() {
    let data = {
      loopPomo: this._autoStartPomo,
      removeTasks: this._removeTasks,
      buttonSounds: this._buttonSounds,
      pomoLength: this._timePomo,
      shortBreakLength: this._timeShortBreak,
      longBreakLength: this._timeLongBreak,
      theme: this._currentTheme,
    };

    localStorage.setItem("data", JSON.stringify(data));
  }

  loadUserPreferences() {
    const dataJSON = localStorage.getItem("data");
    if (!dataJSON) return;

    const data = JSON.parse(dataJSON);
    // console.log(data);

    this._autoStartPomo = data.loopPomo;
    this._removeTasks = data.removeTasks;
    this._buttonSounds = data.buttonSounds;

    this._timeLeft = data.pomoLength;
    this._timePomo = data.pomoLength;
    this._timeShortBreak = data.shortBreakLength;
    this._timeLongBreak = data.longBreakLength;

    this._currentTheme = data.theme;

    // Turning display into time set before:
    this._display.textContent = `${this._timeLeft
      .toString()
      .padStart(2, "0")}:00`;

    // Reflecting settings change on the page:
    const headings = document.querySelectorAll(".menu__heading");
    // console.log(headings);

    headings.forEach((heading) => {
      const icon = heading.nextElementSibling.querySelector(".icon");
      if (!icon) {
        const input = heading.nextElementSibling;
        if (!input) return;

        if (heading.textContent === "Pomodoro") {
          input.placeholder = this._timePomo;
        }
        if (heading.textContent === "Short break") {
          input.placeholder = this._timeShortBreak;
        }
        if (heading.textContent === "Long break") {
          input.placeholder = this._timeLongBreak;
        }

        return;
      }

      // Removing the tick by default for all menu headings:
      icon.classList.remove("completed");

      if (heading.textContent === "Loop pomo & break") {
        if (this._autoStartPomo === true) icon.classList.add("completed");
      }
      if (heading.textContent === "Remove tasks") {
        if (this._removeTasks === true) icon.classList.add("completed");
      }
      if (heading.textContent === "Button sounds") {
        if (this._buttonSounds === true) icon.classList.add("completed");
      }
      if (heading.textContent === this._currentTheme) {
        icon.classList.add("completed");
        document.body.classList.add(heading.textContent.toLowerCase());
      }
    });
  }

  // analytics function() goes here
}

export default new view();

/* 
  // old legacy app code for memories. 

  else if (
          minutes === 0 &&
          seconds === 0 &&
          this._autoShortBreak &&
          startingMode === "POMODORO"
        ) {
          // WHEN THE USER TURNS ON SHORT BREAK.
          if (i > 0) {
            this._timerON = false;
            this._autoShortBreak = false;
            this._display.textContent = "END";

            switchModeTo("pomo");

            setTimeout(
              () =>
                (this._display.textContent = `${this._timePomo
                  .toString()
                  .padStart(2, "0")}:00`),
              1000
            );
            return; // Timer complete.
          }

          switchModeTo("short");

          minutes = this._timeShortBreak;

          this._display.textContent = `${this._timeShortBreak
            .toString()
            .padStart(2, "0")}:00`;

          this._startButton.textContent = "RESET";
          i++;
        }
  */
