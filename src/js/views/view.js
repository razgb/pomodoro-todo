class view {
  _version = 0;

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

  // this just initialises the day.
  _day = 0;

  _timeStudiedToday = 0; // (seconds)
  _sessionsToday = 0;
  _timeStudiedAllTime = 0; // (Seconds) Updated by the localStorage
  _currentYear = 2023;

  loadAppAnimation() {
    const loadingContainer = document.querySelector(".loading-app");
    const loadingHeading = document.querySelector(".loading-app__heading");

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

          if (startingMode === "LONG BREAK") {
            switchModeTo("pomo");

            setTimeout(() => {
              this._display.textContent = `${this._timePomo
                .toString()
                .padStart(2, "0")}:00`;
              this._startButton.textContent = "START";
            }, 1000);
            return;
          }

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
              this.addToAnalytics(minutes); // Live display to user.
              this._saveUserPreferences(); // Only save minutes in study sessions.

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

        if (
          minutes === 0 &&
          seconds === 0 &&
          this._autoStartPomo === false &&
          i < 1
        ) {
          i++;
          this._timerON = false;
          this._display.textContent = "END";
          switchModeTo("pomo");

          if (startingMode === "POMODORO") {
            console.log(this._timePomo);
            this.addToAnalytics(this._timePomo);
            this._saveUserPreferences();
          }
          setTimeout(() => {
            this._display.textContent = `${this._timePomo
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

  addTaskContainerHandler() {
    const openTasksButton = document.querySelector(".open-tasks");
    openTasksButton.addEventListener("click", (e) => {
      document
        .querySelector(".open-tasks__container")
        .classList.toggle("hidden");

      openTasksButton.querySelector(".icon").classList.toggle("open");
    });

    const openTasksContainer = document.querySelector(".open-tasks__container");
    openTasksContainer.addEventListener("click", (e) => {
      const checkBox = e.target.closest(".task__check");
      const icon = checkBox?.querySelector(".icon"); // this is the empty box's icon .

      if (icon) {
        const textArea = checkBox
          .closest(".task")
          .querySelector(".task__textarea");
        const headingText =
          icon.parentElement.previousElementSibling.querySelector(
            ".heading-text"
          );
        const headingIcon = headingText.previousElementSibling;

        // IF CHECKED: MAKE EVERYTHING DARKER ELSE MAKE EVERYTHING BACK TO NORMAL
        if (icon.classList.contains("completed")) {
          icon.classList.remove("completed"); // unticks a ticked box.
          headingText.style.color = "var(--secondary-color-retro)";
          headingIcon.style.color = "var(--secondary-color-retro)";
          icon.style.color = "transparent";
          checkBox.style.border = "3px solid var(--secondary-color-retro)";
          return;
        } else {
          icon.classList.add("completed"); // ticks an unticked box.
          headingText.style.color = "var(--secondary-color-retro--darker)";
          headingIcon.style.color = "var(--secondary-color-retro--darker)";
          icon.style.color = "var(--secondary-color-retro--darker)";
          checkBox.style.border =
            "3px solid var(--secondary-color-retro--darker)";
          textArea.classList.add("hidden");
          return;
        }
      }

      const taskHeadingButton = e.target.closest(".button-md");
      if (taskHeadingButton && taskHeadingButton.textContent !== "CANCEL") {
        const textArea = taskHeadingButton.parentElement.nextElementSibling;
        textArea.classList.toggle("hidden");
        taskHeadingButton.querySelector(".icon").classList.toggle("open");
        return;
      }

      const submitTaskButton = openTasksContainer.querySelector(
        ".submit-task-button"
      );
      const addTaskButton =
        openTasksContainer.querySelector(".add-task-button");
      const cancelTaskButton = openTasksContainer.querySelector(
        ".cancel-task-button"
      );
      const addTaskForm = openTasksContainer.querySelector(".add-task__form");

      if (e.target.closest(".cancel-task-button") === cancelTaskButton) {
        addTaskButton.classList.remove("hidden");
        cancelTaskButton.classList.add("hidden");
        submitTaskButton.classList.add("hidden");
        addTaskForm.classList.add("hidden");
        return;
      }

      if (e.target.closest(".add-task-button") === addTaskButton) {
        addTaskButton.classList.add("hidden");
        submitTaskButton.classList.remove("hidden");
        cancelTaskButton.classList.remove("hidden");
        addTaskForm.classList.remove("hidden");
        return;
      }
    });
  }

  addTaskFormHandler() {
    const openTasksContainer = document.querySelector(".open-tasks__container");

    const taskForm = document.querySelector(".add-task__form");
    ["click", "submit"].forEach((ev) =>
      taskForm.addEventListener(ev, (e) => {
        e.preventDefault();

        const submit = e.target.closest(".submit-task-button");
        if (!submit) return;
        const taskInput = taskForm.querySelector(".add-task__input");
        if (!taskInput.value) return;

        // hide the submit button
        openTasksContainer
          .querySelector(".submit-task-button")
          .classList.add("hidden");

        // hide the task creator
        openTasksContainer
          .querySelector(".add-task__form")
          .classList.add("hidden");

        // show the task button
        openTasksContainer
          .querySelector(".add-task-button")
          .classList.remove("hidden");

        const markup = `
      <div class="task">
      <div class="task__heading">
      <button class="button-md">
      <i class="icon fi fi-bs-angle-small-down open"></i>
      <span class="heading-text">${taskInput.value}</span>
      </button>
      <button class="task__check">
      <i class="icon fi fi-bs-check"></i>
      </button>
      </div>
      <textarea
      class="task__textarea"
      placeholder="Add a note..."
      ></textarea>
      </div>
      `;
        taskInput.value = "";

        taskForm.insertAdjacentHTML("beforebegin", markup);
      })
    );
  }

  // ////////////////////////////////////////////////////////////////////////////////////////////
  // ////////////////////////////////////////////////////////////////////////////////////////////
  // ////////////////////////////////////////////////////////////////////////////////////////////
  // ////////////////////////////////////////////////////////////////////////////////////////////
  // ////////////////////////////////////////////////////////////////////////////////////////////

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

  _calculateTimePassed(seconds) {
    if (!Number.isInteger(0)) return false;
    const dayCalculation = seconds / 3600 / 24;
    const totalDays = Math.trunc(dayCalculation); // 0.34 days = 0, 1.23 days = 1.

    const hourCalculation = Math.trunc(seconds / 3600);
    const totalHours =
      hourCalculation > 24 ? hourCalculation - 24 * totalDays : hourCalculation;

    const minuteCalculation = seconds / 60;
    const totalMins =
      minuteCalculation > 60
        ? Math.round(minuteCalculation - 60 * hourCalculation)
        : Math.round(minuteCalculation);

    return {
      days: totalDays,
      hours: totalHours,
      minutes: totalMins,
    };
  }

  // TURN INTO PRIVATE FUNCTION IN FREE TIME
  // Time argument: Time passed based off this._timerON. If a time didn't fully finish then the time difference will be recorded.
  addToAnalytics(minutes) {
    const mins = Number(minutes);

    const date = new Date();
    const day = date.getDay();
    // console.log(day, this._day);
    if (day !== this._day) {
      this._day = day;
      this._timeStudiedToday = 0;
      this._sessionsToday = 0;
    }

    this._timeStudiedToday += mins * 60;
    this._timeStudiedAllTime += mins * 60; // adds the total time today on to itself.
    if (mins !== 0) ++this._sessionsToday;

    // These are not the total hours & mins.
    const currentTimePassed = this._calculateTimePassed(this._timeStudiedToday);
    const allTimePassed = this._calculateTimePassed(this._timeStudiedAllTime);

    const currentHours = currentTimePassed.hours;
    const currentMinutes = currentTimePassed.minutes;

    const daysAllTime = allTimePassed.days;
    const hoursAllTime = allTimePassed.hours;
    const minutesAllTime = allTimePassed.minutes;

    const analyticsHeadings = document
      .querySelector(".analytics-box")
      .querySelectorAll(".menu__heading");
    analyticsHeadings.forEach((index) => {
      const heading = index.textContent;
      const text = index.nextElementSibling;

      if (heading === "Time studied today:") {
        text.textContent = `${currentHours} hrs, ${currentMinutes} mins`;
      }
      if (heading === "Sessions today:") {
        text.textContent = `${this._sessionsToday} ${
          this._sessionsToday > 1 ? "sessions" : "session"
        }`;
      }
      if (heading === `Total time (${this._currentYear}):`) {
        text.textContent = `${daysAllTime}d, ${hoursAllTime}h, ${minutesAllTime}m`;
      }
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
      version: this._version,

      day: this._day,

      timeStudiedToday: this._timeStudiedToday,
      sessionsToday: this._sessionsToday,
      timeStudiedAllTime: this._timeStudiedAllTime,
    };

    localStorage.setItem("data", JSON.stringify(data));
  }

  loadUserPreferences() {
    // bring menu back to page's z-index:
    document.querySelector(".menu").style.zIndex = 0;

    // Show HTML after loading setings finish.
    document.querySelector(".main").style.display = "block";

    let dataJSON = localStorage.getItem("data");
    if (!dataJSON) return;
    const data = JSON.parse(dataJSON);

    // for past beta version users.
    if (!data.version) {
      this.resetUserPreferences();
      this._version = 1;
      this._saveUserPreferences();
      return;
    }

    console.log(data);

    this._version = data.version;

    this._autoStartPomo = data.loopPomo;
    this._removeTasks = data.removeTasks;
    this._buttonSounds = data.buttonSounds;
    this._timeLeft = data.pomoLength;
    this._timePomo = data.pomoLength;
    this._timeShortBreak = data.shortBreakLength;
    this._timeLongBreak = data.longBreakLength;
    this._currentTheme = data.theme;

    this._day = data.day;
    this._timeStudiedToday = data.timeStudiedToday;
    this._sessionsToday = data.sessionsToday;
    this._timeStudiedAllTime = data.timeStudiedAllTime;

    // Reset user preferences if version not 1.0

    // Turning display into pomo time set in last session:
    this._display.textContent = `${this._timeLeft
      .toString()
      .padStart(2, "0")}:00`;

    // Little trick: 0 minutes added.
    this.addToAnalytics(0);

    // APPLIES ALL CODE WRITTEN ABOVE TO EACH SETTING.
    const headings = document.querySelectorAll(".menu__heading");
    headings.forEach((heading) => {
      const icon = heading.nextElementSibling.querySelector(".icon");
      if (!icon) {
        const input = heading.nextElementSibling;
        if (!input) return;

        if (heading.textContent === "Pomodoro") {
          input.placeholder = this._timePomo;
          return;
        }
        if (heading.textContent === "Short break") {
          input.placeholder = this._timeShortBreak;
          return;
        }
        if (heading.textContent === "Long break") {
          input.placeholder = this._timeLongBreak;
          return;
        }

        return;
      }

      // Removing the tick by default for all menu headings:
      icon.classList.remove("completed");

      if (heading.textContent === "Loop pomo & break") {
        if (this._autoStartPomo === true) {
          icon.classList.add("completed");
          return;
        }
      }
      if (heading.textContent === "Remove tasks") {
        if (this._removeTasks === true) {
          icon.classList.add("completed");
          document.querySelector(".tasks").classList.add("hidden");
          return;
        }
      }
      if (heading.textContent === "Button sounds") {
        if (this._buttonSounds === true) {
          icon.classList.add("completed");
          return;
        }
      }
      if (heading.textContent === this._currentTheme) {
        icon.classList.add("completed");
        document.body.classList.add(heading.textContent.toLowerCase());
      }
    });
  }

  resetUserPreferences() {
    localStorage.setItem("data", "");
  }
}

export default new view();

/*     const currentTimePassed = this._calculateTimePassed(this._timeStudiedToday);
    const allTimePassed = this._calculateTimePassed(this._timeStudiedAllTime);
    const currentHours = currentTimePassed.hours;
    const currentMinutes = currentTimePassed.minutes;
    const daysAllTime = allTimePassed.days;
    const hoursAllTime = allTimePassed.hours;
    const minutesAllTime = allTimePassed.minutes;
    if (heading.textContent === "Time studied today:") {
      heading.nextElementSibling.textContent = `${currentHours} hrs, ${currentMinutes} mins`;
    }
    if (heading.textContent === "Sessions today:") {
      heading.nextElementSibling.textContent = `${this._sessionsToday} ${
        this._sessionsToday > 0 ? "sessions" : "session"
      }`;
    }
    if (heading.textContent === "Time studied today:") {
      heading.nextElementSibling.textContent = `${daysAllTime}d, ${hoursAllTime}h, ${minutesAllTime}m`;
    }
*/
