import view from "./view.js";

class displayView extends view {
  _pageVisiblible = true;
  _timerSecondsTracker = 0;
  _timerWorker;

  _timerMessageShowing = false;

  _resetTimerWorker() {
    if (this._timerWorker) {
      this._timerWorker.terminate();
      this._timerWorker = undefined;
    }
  }

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
        this._resetTimerWorker();
        view._timeLeft = view._timePomo;
        view._display.textContent = `${view._timePomo
          .toString()
          .padStart(2, "0")}:00`;
        view._startButton.textContent = "START";
        view._timerState = false;
        return;
      }
      if (mode.textContent === "SHORT BREAK") {
        this._resetTimerWorker();
        view._timeLeft = view._timeShortBreak;
        view._display.textContent = `${view._timeShortBreak
          .toString()
          .padStart(2, "0")}:00`;
        view._startButton.textContent = "START";
        view._timerState = false;
        return;
      }
      if (mode.textContent === "LONG BREAK") {
        this._resetTimerWorker();
        view._timeLeft = view._timeLongBreak;
        view._display.textContent = `${view._timeLongBreak
          .toString()
          .padStart(2, "0")}:00`;
        view._startButton.textContent = "START";
        view._timerState = false;
        return;
      }
    });
  }

  _visibilityHandler() {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") this._pageVisiblible = false;
      if (document.visibilityState === "visible") this._pageVisiblible = true;
    });
  }

  // Might switch to the main view file.
  _changeDisplay(seconds) {
    if (seconds < 0 || !view._timerState) return; // ONLY RUNS WHEN TIMER ON.
    const mins = Math.trunc(seconds / 60 ? seconds / 60 : 0)
      .toString()
      .padStart(2, "0"); // cuts decimal part off
    const secs = Math.round(seconds % 60 ? seconds % 60 : 0)
      .toString()
      .padStart(2, "0"); // the decimal part
    view._display.textContent = `${mins}:${secs}`;
  }

  addStartButtonHandler2() {
    const modeButtons = document.querySelector(".display__buttons");
    const switchModeTo = (mode) => {
      // (info) mode name as a string.
      modeButtons
        .querySelectorAll(".button-lg")
        .forEach((button) => button.classList.remove("mode-active"));
      document.querySelector(`.btn-${mode}`).classList.add("mode-active");
    };

    view._startButton.addEventListener("click", () => {
      if (this._timerMessageShowing) return; // error handling during message between modes.

      let seconds = view._timeLeft * 60;
      const startButtonText = view._startButton.textContent;
      const startingMode = document.querySelector(".mode-active").textContent;
      let currentMode = startingMode;

      if (startButtonText === "START") {
        view._timerState = true; // start button has been clicked
        view._display.textContent = "START";
        setTimeout(() => (view._startButton.textContent = "RESET"), 150);
      } else {
        // RESET button has been clicked.
        this._resetTimerWorker();
        view._timerState = false;
        view._display.textContent = "RESET";
        switchModeTo("pomo");
        console.log("worker terminated due to reset button"); // temp

        setTimeout(() => {
          view._display.textContent = `${view._timePomo
            .toString()
            .padStart(2, "0")}:00`;
          view._timeLeft = view._timePomo;
          view._startButton.textContent = "START";
        }, 1000);

        return;
      }

      if (!this._timerWorker) {
        this._timerWorker = new Worker(
          new URL("src/js/timerWorker.js", import.meta.url)
        );
      }

      this._timerWorker.postMessage({
        timerState: view._timerState,
        seconds: seconds,
        currentMode: currentMode,
      });

      this._timerWorker.onmessage = (e) => {
        seconds = e.data.seconds;
        currentMode = e.data.currentMode;
        view._timerState = e.data.timerState;
        // console.log(seconds, currentMode, view._timerState);

        if (!view._timerState) {
          this._timerWorker.terminate();
          return;
        }

        if (seconds === 0 && view._autoStartPomo && !this._pageVisiblible) {
          if (currentMode === "Pomodoro")
            this._showNotifications("Short break");
          else if (currentMode === "Short break")
            this._showNotifications("Pomodoro");
          else if (currentMode === "Long break")
            this._showNotifications("Long break");
        }

        if (seconds === 0 && view._autoStartPomo && this._pageVisiblible) {
          view._display.textContent = "END";

          if (startingMode === "LONG BREAK") {
            switchModeTo("pomo");
            setTimeout(() => {
              this._changeDisplay(view._timePomo * 60);
              view._timerState = false;
              view._startButton.textContent = "START";
              this._showNotifications("Long break");
            }, 1000);
            return;
          }

          if (currentMode === "Pomodoro")
            this._showNotifications("Short break");
          else this._showNotifications("Pomodoro");

          let messageIndex = 0;
          this._timerMessageShowing = true;
          setTimeout(() => {
            // prettier-ignore
            const messages = [`${currentMode === "POMODORO" ? "POMO" : "SHORT"}`, `${currentMode === "POMODORO" ? "DORO" : "BREAK"}`,"IN","3","2","1"];
            let timerMessage = setInterval(() => {
              view._display.textContent = messages[messageIndex];
              messageIndex++;
              if (messageIndex > 5) {
                clearInterval(timerMessage);
                return;
              }
            }, 500); // in total 3000
          }, 1000);

          // timeout used to wait for mode change message to run.
          setTimeout(() => {
            this._timerMessageShowing = false;

            // current mode changes inside worker.
            if (currentMode === "SHORT BREAK") {
              view._timerState = true;
              switchModeTo("short");
              seconds = view._timeShortBreak * 60;
              view._timeLeft = view._timeShortBreak;
              this.addToAnalytics(view._timePomo); // Live display to user.
              this._saveUserPreferences(); // Only save minutes in study sessions.
              this.playAudio("retroEnd");
              this._changeDisplay(seconds);
              this._timerWorker.postMessage({
                timerState: view._timerState,
                seconds: seconds,
                currentMode: currentMode,
              });
            } else if (currentMode === "POMODORO") {
              view._timerState = true;
              switchModeTo("pomo");
              seconds = view._timePomo * 60;
              view._timeLeft = view._timePomo;
              this.playAudio("retroStart");
              this._changeDisplay(seconds);
              this._timerWorker.postMessage({
                timerState: view._timerState,
                seconds: seconds,
                currentMode: currentMode,
              });
            }
            //
          }, 4500); // 1000 + 3000 + on purpose 500 to make the last second show nicely.
        }

        //

        // thought for the future: add a visibilitychange check so that this doesnt run when tabs are changed.
        if (
          seconds === 0 &&
          view._autoStartPomo === false &&
          this._pageVisiblible
        ) {
          view._timerState = false;
          view._display.textContent = "END";
          switchModeTo("pomo");
          this._resetTimerWorker();
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
          this._showNotifications("Timer complete");
          return;
        } // Timer complete.

        this._changeDisplay(seconds);
      };
    });
  }

  /*
  addStartButtonHandler() {
    // this._checkVisibilityHandler();

    const modeButtons = document.querySelector(".display__buttons");
    // EVENT LISTENER
    view._startButton.addEventListener("click", () => {
      this._timeDifference = 0; // reset. (when user times out when timer off)
      this._timerSecondsTracker = 0; // reset.
      let seconds = view._timeLeft * 60;
      
      const switchModeTo = (mode) => {
        // (info) mode name as a string.
        modeButtons
        .querySelectorAll(".button-lg")
        .forEach((button) => button.classList.remove("mode-active"));
        document.querySelector(`.btn-${mode}`).classList.add("mode-active");
      };

      if (view._startButton.textContent === "START") {
        view._timerState = true; // start button has been clicked
        view._display.textContent = "START";
        setTimeout(() => view._startButton.textContent = "RESET", 150);
        // setTimeout(() => (view._startButton.textContent = "RESET"), 1000);
      } else {
        view._timerState = false; // reset button has been clicked
        view._display.textContent = "RESET";
        switchModeTo("pomo");
        setTimeout(() => {
          view._display.textContent = `${view._timePomo
            .toString()
            .padStart(2, "0")}:00`;
          view._timeLeft = view._timePomo;
          view._startButton.textContent = "START";
        }, 1000);
      }
      // Has to be defined afer determining what the start button is.
      const startingMode = document.querySelector(".mode-active").textContent;
      let i = 0; // used to make the infinite loop run once fully every interval.
      let currentMode = startingMode;
      let timer = setInterval(() => {
        if (!view._timerState && view._startButton.textContent !== "RESET") {
          clearInterval(timer);
          return;
        }

        if (seconds === 0 && view._autoStartPomo && i < 1) {
          i++;
          view._display.textContent = "END";
          if (startingMode === "LONG BREAK") {
            switchModeTo("pomo");
            setTimeout(() => {
              this._changeDisplay(view._timePomo * 60); 
              view._timerState = false;
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
              view._timerState = true;
              switchModeTo("short");
              seconds = view._timeShortBreak * 60;
              view._timeLeft = view._timeShortBreak; 
              this.addToAnalytics(view._timePomo); // Live display to user.
              this._saveUserPreferences(); // Only save minutes in study sessions.
              currentMode = "SHORT BREAK";
              this.playAudio('retroEnd'); 
              this._changeDisplay(seconds); 
              i = 0;
              return;
            } else if (currentMode === "SHORT BREAK") {
              view._timerState = true;
              switchModeTo("pomo");
              seconds = view._timePomo * 60;
              view._timeLeft = view._timePomo; 
              currentMode = "POMODORO";
              this.playAudio('retroStart'); 
              this._changeDisplay(seconds); 
              i = 0;
              return;
            }
          }, 4500); // 1000 + 3000 + on purpose 500 to make the last second show nicely.
        }

        //

        if (
          seconds === 0 &&
          view._autoStartPomo === false &&
          i < 1
        ) {
          i++;
          view._timerState = false;
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

        
        // if (this._timeDifference) {
          //   seconds -= this._timeDifference;
          //   this._timeDifference = 0; // reset the timeout.
          // }; 
          // if (this._tabbedOut) return;  // temporary
          
          // Needed for the infinite timer loop feature
          if (!view._timerState) return;
          --seconds;
        this._timerSecondsTracker = seconds; 
        if (seconds < 0) return;

        this._changeDisplay(seconds); 
      }, 1000);
    });
  }


  _checkVisibilityHandler = () => {
    let visibleDate;
    let hiddenDate;

    document.addEventListener("visibilitychange", () => {      
      if (document.visibilityState === "hidden") {
        const date = new Date();
        hiddenDate = date.getTime(); 
        this._tabbedOut = true; 
      }
      if (document.visibilityState === "visible") {
        const date = new Date();
        visibleDate = date.getTime();
      }
      
      const timeDifference = visibleDate - hiddenDate;
      // I.E: 500 MILLISECONDS
      if (visibleDate && hiddenDate && timeDifference >= 500) {
        this._timeDifference = Math.round(timeDifference/1000); 
        this._tabbedOut = false;
        
        if (this._timeDifference > this._timerSecondsTracker && view._timerState) {
          // for when user tabs out for longer than timer length. 
          this._changeDisplay(view._timeLeft * 60);
          view._startButton.textContent = 'START'; 
          view._timerState = false; 
          document.querySelector('.display__timeout').classList.remove('hidden');
          // THIS WILL BE TEMPORARY UNTIL I CAN FIND SOUND FILES. 
          setTimeout(() => document.querySelector('.display__timeout').classList.add('hidden'), 4000);
          return;
        } 
      }
      else return;
      
      // console.log(`Timeout length: ${this._timeDifference} seconds` );
    });
  };
   */
}

export default new displayView();
