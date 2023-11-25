class view {
  _parentContainer = "";
  _menuState = false;

  _display = document.querySelector(".display__timer-numbers");
  _startButton = document.querySelector(".display__start-button");
  _timerON = false;
  _timeLeft = 25;

  _autoBreak = false;
  _autoStartPomo = false;

  // default values
  _timePomo = 25;
  _timeShortBreak = 5;
  _timeLongBreak = 15;

  render() {}

  _clear() {
    this._parentContainer.innerHTML = "";
  }

  // ADDS MENU SLIDER /W ANIMATION.s
  addMenuSliderHandler() {
    const menuButton = document.querySelector(".menu__hamburger");
    menuButton.addEventListener("click", function () {
      const menuTab = document.querySelector(".menu");
      const app = document.querySelector(".app");

      if (!this._menuState) {
        menuTab.style.transform = "translateX(0)";
        app.style.marginLeft = "20%";
        this._menuState = true;
      } else {
        menuTab.style.transform = "translateX(-110%)";
        app.style.marginLeft = "0";
        this._menuState = false;
      }
    });
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
        this._display.textContent = `${this._thisShortBreak
          .toString()
          .padStart(2, "0")}:00`;
        this._timerON = false;
      }
      if (mode.textContent === "LONG BREAK") {
        this._timeLeft = this._timeLongBreak;
        this._display.textContent = `${this._thisLongBreak
          .toString()
          .padStart(2, "0")}:00`;
        this._timerON = false;
      }
    });

    this._startButton.addEventListener("click", () => {
      // currentMode = this._mode;

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

      let timer = setInterval(() => {
        // Guard clause
        if (!this._timerON) {
          clearInterval(timer);
          this._startButton.textContent = "START";
          return;
        }

        if (minutes === 0 && seconds === 0) return; // Timer complete.

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

  // CALLBACK FUNCTION TO ADD/REMOVE A TICK
  _addMenuTickCheckHandler(e) {
    const icon = e.target.closest(".icon"); // this is the empty box's icon .
    if (!icon) return false;

    console.log(icon);

    if (icon.classList.contains("completed")) {
      icon.classList.remove("completed"); // unticks a ticked box.
      return;
    } else {
      icon.classList.add("completed"); // ticks an unticked box.
      return icon;
    }
  }

  // Contains: auto start pomo, auto start break, remove tasks settings.
  addMenuSettings() {}

  addMenuTheme() {
    const themeContainer = document.querySelector(".theme-box");

    themeContainer.addEventListener("click", (e) => {
      themeContainer
        .querySelectorAll(".icon")
        .forEach((icon) => icon.classList.remove("completed"));

      const icon = this._addMenuTickCheckHandler(e);
      console.log(icon);

      // const themeButton = e.target.closest('.button')
    });
  }

  addMenuConfig() {
    const configContainer = document.querySelector(".config-box");

    configContainer.addEventListener("input", (e) => {
      const userTimeInput = e.target.closest(".menu__input").value;

      const inputCheck = () => {
        // IF USER LEAVES FIELD EMPTY (with a limit of 3 chars - dirty solve)
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

      const configMode = e.target
        .closest(".menu__input")
        .parentElement.querySelector(".menu__subbuttons-heading").textContent;

      const resetModeToPomo = function () {
        const modeButtons = document.querySelector(".display__buttons");
        modeButtons
          .querySelectorAll(".button-lg")
          .forEach((button) => button.classList.remove("mode-active"));

        document.querySelector(".btn-pomo").classList.add("mode-active");
      };

      if (configMode === "Pomodoro") {
        // console.log(`Input check ans: ${inputCheck(this._timePomo)}`);
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
        resetModeToPomo();
      }

      if (configMode === "Long break") {
        if (!inputCheck()) return;

        this.timeLeft = this._timeLongBreak = userTimeInput;
        this._timerON = false;
        resetModeToPomo();
      }
    });
  }
}

export default new view();
