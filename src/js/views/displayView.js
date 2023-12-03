import view from "./view.js";

class displayView extends view {
  // Changes modes
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
        view._timeLeft = view._timePomo;
        view._display.textContent = `${view._timePomo
          .toString()
          .padStart(2, "0")}:00`;
        view._startButton.textContent = "START";
        view._timerON = false;
      }
      if (mode.textContent === "SHORT BREAK") {
        view._timeLeft = view._timeShortBreak;
        view._display.textContent = `${view._timeShortBreak
          .toString()
          .padStart(2, "0")}:00`;
        view._startButton.textContent = "START";
        view._timerON = false;
      }
      if (mode.textContent === "LONG BREAK") {
        view._timeLeft = view._timeLongBreak;
        view._display.textContent = `${view._timeLongBreak
          .toString()
          .padStart(2, "0")}:00`;
        view._startButton.textContent = "START";
        view._timerON = false;
      }
    });
  }

  // App works based of start button.
  addStartButtonHandler() {
    const modeButtons = document.querySelector(".display__buttons");
    // EVENT LISTENER
    view._startButton.addEventListener("click", () => {
      let minutes = view._timeLeft;
      let seconds = 0;
      const switchModeTo = function (mode) {
        // (info) mode name as a string.
        modeButtons
          .querySelectorAll(".button-lg")
          .forEach((button) => button.classList.remove("mode-active"));
        document.querySelector(`.btn-${mode}`).classList.add("mode-active");
      };
      if (view._startButton.textContent === "START") {
        view._timerON = true; // start button has been clicked
        view._display.textContent = "START";
        view._startButton.textContent = "RESET";
        // setTimeout(() => (view._startButton.textContent = "RESET"), 1000);
      } else {
        view._timerON = false; // reset button has been clicked
        view._display.textContent = "RESET";
        switchModeTo("pomo");
        setTimeout(() => {
          view._display.textContent = `${view._timeLeft
            .toString()
            .padStart(2, "0")}:00`;
          view._startButton.textContent = "START";
        }, 1000);
      }
      // Has to be defined afer determining what the start button is.
      const startingMode = document.querySelector(".mode-active").textContent;
      let i = 0; // used to make the infinite loop run once fully every interval.
      let currentMode = startingMode;
      let timer = setInterval(() => {
        if (!view._timerON && view._startButton.textContent !== "RESET") {
          clearInterval(timer);
          return;
        }
        if (minutes === 0 && seconds === 0 && view._autoStartPomo && i < 1) {
          i++;
          view._timerON = false;
          view._display.textContent = "END";
          if (startingMode === "LONG BREAK") {
            switchModeTo("pomo");
            setTimeout(() => {
              view._display.textContent = `${view._timePomo
                .toString()
                .padStart(2, "0")}:00`;
              view._startButton.textContent = "START";
            }, 1000);
            return;
          }
          let messageIndex = 0;
          setTimeout(() => {
            // prettier-ignore
            const messages = [`${currentMode === "POMODORO" ? "SHORT" : "POMO"}`, `${currentMode === "POMODORO" ? "BREAK" : "DORO"}`,"IN","3","2","1"];
            let timerMessage = setInterval(() => {
              view._display.textContent = messages[messageIndex];
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
              view._timerON = true;
              switchModeTo("short");
              minutes = view._timeShortBreak;
              this.addToAnalytics(minutes); // Live display to user.
              this._saveUserPreferences(); // Only save minutes in study sessions.
              currentMode = "SHORT BREAK";
              view._display.textContent = `${view._timeShortBreak
                .toString()
                .padStart(2, "0")}:00`;
              i = 0;
              return;
            } else if (currentMode === "SHORT BREAK") {
              view._timerON = true;
              switchModeTo("pomo");
              minutes = view._timePomo;
              currentMode = "POMODORO";
              view._display.textContent = `${view._timePomo
                .toString()
                .padStart(2, "0")}:00`;
              i = 0;
              return;
            }
          }, 4500); // 1000 + 3000 + on purpose 500 to make the last second show nicely.
        }
        //
        if (
          minutes === 0 &&
          seconds === 0 &&
          view._autoStartPomo === false &&
          i < 1
        ) {
          i++;
          view._timerON = false;
          view._display.textContent = "END";
          switchModeTo("pomo");
          if (startingMode === "POMODORO") {
            // console.log(view._timePomo);
            this.addToAnalytics(view._timePomo);
            this._saveUserPreferences();
          }
          setTimeout(() => {
            view._display.textContent = `${view._timePomo
              .toString()
              .padStart(2, "0")}:00`;
            view._startButton.textContent = "START";
          }, 1000);
          return;
        } // Timer complete.
        // Needed for the infinite timer loop feature
        if (!view._timerON || i >= 1) return;
        --seconds;
        if (seconds < 0) {
          --minutes;
          seconds = 59;
        }
        view._display.textContent = `${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      }, 50);
    });
  }
}

export default new displayView();
