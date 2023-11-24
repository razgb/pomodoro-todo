class view {
  _parentContainer = "";
  _menuState = false;

  _display = document.querySelector(".display__timer-numbers");
  _startButton = document.querySelector(".display__start-button");
  _timerON = false;
  _timeLeft = 25;

  render() {}

  _clear() {
    this._parentContainer.innerHTML = "";
  }

  // ADDS MENU SLIDER /W ANIMATION.
  addHandlerMenu() {
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

  addModeHandler() {
    const modeButtons = document.querySelector(".display__buttons");

    // Delegates event to the container of all mode buttons.
    modeButtons.addEventListener("click", (e) => {
      const mode = e.target.closest(".button-lg");
      if (!mode) return;

      // Removes the already active mode (pressed down illusion).
      modeButtons
        .querySelectorAll(".button-lg")
        .forEach((button) => button.classList.remove("mode-active"));

      // adds back the illusion to the clicked mode button
      mode.classList.add("mode-active");

      // dynamically changes the timeLeft variable to fit mode's function.
      if (mode.textContent === "POMODORO") {
        this._display.textContent = "25:00";
        this._timeLeft = 25;
      }
      if (mode.textContent === "SHORT BREAK") {
        this._display.textContent = "05:00";
        this._timeLeft = 5;
      }
      if (mode.textContent === "LONG BREAK") {
        this._display.textContent = "15:00";
        this._timeLeft = 15;
      }
    });
  }

  // THIS FUNCTION IS RUN BY THE addModeHandler FUNCTION!!!
  addStartButtonHandler() {
    // Arrow func used to access object.
    this._startButton.addEventListener("click", () => {
      let minutes = this._timeLeft;
      let seconds = 0;

      // start button has been clicked
      if (this._startButton.textContent === "START") {
        this._timerON = true;
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
}

export default new view();
