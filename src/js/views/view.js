class view {
  _parentContainer = "";
  _menuState = false;
  _display = document.querySelector(".display__timer-numbers");
  _startButton = document.querySelector(".display__start-button");
  _timerON = false;

  render() {}

  _clear() {
    this._parentContainer.innerHTML = "";
  }

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
    modeButtons.addEventListener("click", (e) => {
      const mode = e.target.closest(".button-lg");
      if (!mode) return;

      if (mode.textContent === "POMODORO") this._display.textContent = "25:00";
      if (mode.textContent === "SHORT BREAK")
        this._display.textContent = "05:00";
      if (mode.textContent === "LONG BREAK")
        this._display.textContent = "15:00";
    });
  }

  addStartButtonHandler() {
    // Arrow func used to access object through 'this' keyword.
    this._startButton.addEventListener("click", () => {
      let timeLeft = 25; // 25 minutes
      let minutes = timeLeft;
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
          this._display.textContent = "25:00";
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
