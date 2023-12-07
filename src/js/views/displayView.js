import view from "./view.js";

class displayView extends view {
  _timeDifference = 0; 
  _tabbedOut = false; 
  _timerSecondsTracker = 0; 

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

  // IDEA 1 TO MAKE THIS WORK IN THE BACKGROUND:
  /* 
  - Use the page visibility API and when the page is not visible, start a new Date(). 
  - Use this date to make a time stamp of when the user left the website. 
  - Once the user comes back (so visibility = true), create another date object and then record
  the difference between in another variable. 
  - Since this function is located inside the handler below, convert the millisecond difference
  into 'minutes' and 'seconds' and then subtract it from the timer. 
  
  - ERROR handling: if the user times out for too long and time difference > timeLeft on timer: 
  end the timer, switch mode & display back to pomo. 
  */

  // IDEA 2:
  /* 
 Use web workers API to run the minutes and seconds subtraction function in the background, 
 once the user tabs back in using the visibility API, subtract the returned data from the 
 web worker from the actual minutes and seconds
 */

  // IDEA 3:
  /* 
Fully move the entire setInterval function to the webworkers API and send data 
back and forth every time a loop ends. 
*/

// make sure to add a way to turn off this event listener mid handler function. 
  _checkVisibilityHandler = () => {
    console.log('visibility function active.')
    let visibleDate;
    let hiddenDate;
    // console.log(`Hidden time stamp: ${hiddenDate}`);
    // console.log(`Visible time stamp: ${visibleDate}`); 

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
        
        if (this._timeDifference > this._timerSecondsTracker) {
          console.log(this._timeDifference, this._timerSecondsTracker);

          // for when user tabs out for longer than timer length. 
          this._changeDisplay(view._timeLeft * 60);
          view._startButton.textContent = 'START'; 
          view._timerON = false;
          document.querySelector('.display__timeout').classList.remove('hidden');
          // THIS WILL BE TEMPORARY UNTIL I CAN FIND SOUND FILES. 
          setTimeout(() => document.querySelector('.display__timeout').classList.add('hidden'), 4000);
          return;
        } 
      }
      else return;
      
      console.log('User timed out.');
      console.log(timeDifference, this._timeDifference);
    });
  };

  // Might switch to the main view file. 
  _changeDisplay(seconds) {
    if (seconds < 0 || !view._timerON) return; // ONLY RUNS WHEN TIMER ON. 
    const mins = Math.trunc(seconds / 60 ? seconds / 60 : 0).toString().padStart(2, '0'); // cuts decimal part off
    const secs = Math.round(seconds % 60 ? seconds % 60 : 0).toString().padStart(2, '0'); // the decimal part
    view._display.textContent = `${mins}:${secs}`;
  }

  // App works based of start button.
  addStartButtonHandler() {
    this._checkVisibilityHandler();
    ////////////////////////////////

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
        view._timerON = true; // start button has been clicked
        view._display.textContent = "START";
        view._startButton.textContent = "RESET";
        // setTimeout(() => (view._startButton.textContent = "RESET"), 1000);
      } else {
        view._timerON = false; // reset button has been clicked
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
        if (!view._timerON && view._startButton.textContent !== "RESET") {
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
              view._timerON = false;
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
              seconds = view._timeShortBreak * 60;
              view._timeLeft = view._timeShortBreak; 
              this.addToAnalytics(view._timePomo); // Live display to user.
              this._saveUserPreferences(); // Only save minutes in study sessions.
              currentMode = "SHORT BREAK";
              this._changeDisplay(seconds); 
              i = 0;
              return;
            } else if (currentMode === "SHORT BREAK") {
              view._timerON = true;
              switchModeTo("pomo");
              seconds = view._timePomo * 60;
              view._timeLeft = view._timePomo; 
              currentMode = "POMODORO";
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

        if (this._timeDifference) {
          seconds -= this._timeDifference;
          this._timeDifference = 0; // reset the timeout.
        }; 


        if (this._tabbedOut) return; 
        --seconds;
        this._timerSecondsTracker = seconds; 
        if (seconds < 0) return;

        this._changeDisplay(seconds); 
      }, 1000);
    });
  }
}

export default new displayView();
