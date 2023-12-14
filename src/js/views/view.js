export default class view {
  static _deviceType = "Desktop"; // default.

  static _version = 0;
  static _parentContainer = "";
  static _currentTheme = "Default";
  static _menuState = false;

  static _notificationsState = false;
  static _notificationUserResponseState = false;
  // static _pageVisibility = true; DEPRACATED.

  static _display = document.querySelector(".display__timer-numbers");
  static _startButton = document.querySelector(".display__start-button");
  static _timerState = false;
  static _timeLeft = 25;

  static _autoStartPomo = true;
  static _removeTasks = false;
  static _buttonSounds = true;

  // default values
  static _timePomo = 25;
  static _timeShortBreak = 5;
  static _timeLongBreak = 15;

  // Initialises the day. (used to reset daily hours studied and sessions studied on a new day)
  static _day = 0;

  static _timeStudiedToday = 0; // (seconds)
  static _sessionsToday = 0;
  static _timeStudiedAllTime = 0; // (Seconds) Updated by the localStorage
  static _currentYear = 2023;

  static _openTasksContainer = document.querySelector(".open-tasks__container");

  screenChangeHandler() {
    const mediaQueryMobile = window.matchMedia("(max-width: 450px)");
    const mediaQueryTablet = window.matchMedia("(max-width: 900px)");
    const mediaQueryDesktop = window.matchMedia("(min-width: 901px)");
    const checkDeviceType = () => {
      if (mediaQueryMobile.matches) {
        // console.log("Phone");
        view._deviceType = "Phone";
      } else if (mediaQueryTablet.matches) {
        // console.log("Tablet");
        view._deviceType = "Tablet";
      } else {
        // console.log("Desktop");
        view._deviceType = "Desktop";
      }
      console.log(view._deviceType);
    };
    checkDeviceType();

    [mediaQueryMobile, mediaQueryTablet, mediaQueryDesktop].forEach((item) =>
      item.addEventListener("change", checkDeviceType)
    );
  }

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

  // DEPRACATED FUNCTION.
  // visibilityHandler() {
  //   document.addEventListener("visibilitychange", () => {
  //     if (document.visibilityState === "hidden") view._pageVisibility = false;
  //     if (document.visibilityState === "visible") view._pageVisibility = true;
  //   });
  // }

  _requestNotifications() {
    if (Notification.permission !== "granted") {
      const allowNotificationsCheckBox = document.querySelector(".notif-check");
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          view._notificationsState = true;
          allowNotificationsCheckBox.classList.add("completed");
        } else {
          view._notificationsState = false; // in case allow is clicked and then denied browser's one.
          allowNotificationsCheckBox.classList.remove("completed");
        }

        view._notificationUserResponseState = true; // user has responded.
        console.log("User responded with: ", view._notificationsState);

        this._saveUserPreferences();
      });
    }
  }

  notificationPermissionHandler() {
    const notifictionsContainer = document.querySelector(".notifications");
    if (view._notificationUserResponseState || view._deviceType !== "Desktop")
      return;

    // show the initial prompt to then open the browser request.
    setTimeout(() => notifictionsContainer.classList.remove("hidden"), 4000);

    notifictionsContainer.addEventListener("click", (e) => {
      const button = e.target.closest(".button-md");
      if (!button) return;

      if (button.textContent === "Allow") this._requestNotifications();
      if (button.textContent === "Decline") view._notificationsState = false;

      notifictionsContainer.classList.add("hidden");
    });
  }

  _showNotifications(notificationHeading) {
    if (typeof notificationHeading !== "string" || !view._notificationsState)
      return;

    // If user turns off notifications through the settings.
    if (Notification.permission !== "granted") {
      view._notificationsState = false;
      this._saveUserPreferences();
      return;
    }

    let bodyMessage = "";
    if (notificationHeading === "Pomodoro")
      bodyMessage = "Short break starting soon...";
    else if (notificationHeading === "Short break")
      bodyMessage = "Pomodoro session starting soon...";

    new Notification(`${notificationHeading} comeplete.`, {
      body: `${bodyMessage}`,
    });
  }

  playAudio(audioName) {
    if (typeof audioName !== "string") return;
    const audio = document.querySelector(`.${audioName}`);
    audio.currentTime = 0;
    audio.play();
  }

  addAudioForButtons() {
    document.body.addEventListener("click", (e) => {
      const button = e.target.closest(".audioButton");
      if (!button || !view._buttonSounds) return;

      const buttonText = button.textContent;
      if (buttonText === "START") this.playAudio("retroStart");
      else if (buttonText === "RESET") this.playAudio("retroEnd");
      else this.playAudio("retroClick");
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
  // Time argument: Time passed based off view._timerON. If a time didn't fully finish then the time difference will be recorded.
  addToAnalytics(minutes) {
    const mins = Number(minutes);

    const date = new Date();
    const day = date.getDay();
    // console.log(day, view._day);
    if (day !== view._day) {
      view._day = day;
      view._timeStudiedToday = 0;
      view._sessionsToday = 0;
    }

    view._timeStudiedToday += mins * 60;
    view._timeStudiedAllTime += mins * 60; // adds the total time today on to itself.
    if (mins !== 0) ++view._sessionsToday;

    // These are not the total hours & mins.
    const currentTimePassed = this._calculateTimePassed(view._timeStudiedToday);
    const allTimePassed = this._calculateTimePassed(view._timeStudiedAllTime);

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
        text.textContent = `${view._sessionsToday} ${
          view._sessionsToday > 1 ? "sessions" : "session"
        }`;
      }
      if (heading === `Total app usage:`) {
        text.textContent = `${daysAllTime}d, ${hoursAllTime}h, ${minutesAllTime}m`;
      }
    });
  }

  // Used at the end of each settings handler to save user settings.
  _saveUserPreferences() {
    let data = {
      notificationsState: view._notificationsState,
      notificationUserResponseState: view._notificationUserResponseState,

      loopPomo: view._autoStartPomo,
      removeTasks: view._removeTasks,
      buttonSounds: view._buttonSounds,
      pomoLength: view._timePomo,
      shortBreakLength: view._timeShortBreak,
      longBreakLength: view._timeLongBreak,
      theme: view._currentTheme,
      version: view._version,

      day: view._day,

      timeStudiedToday: view._timeStudiedToday,
      sessionsToday: view._sessionsToday,
      timeStudiedAllTime: view._timeStudiedAllTime,

      openTasksContainerMarkup: view._openTasksContainer.innerHTML,
      taskNotes: this._saveOpenTasksContainerNotes(), // array of notes
    };

    localStorage.setItem("data", JSON.stringify(data));
  }

  _saveOpenTasksContainerNotes() {
    const notes = [];
    view._openTasksContainer
      .querySelectorAll(".task__textarea")
      .forEach((box) => notes.push(box.value));
    // console.log(notes);
    return notes;
  }

  _loadOpenTasksContainerNotes(notesArr) {
    view._openTasksContainer
      .querySelectorAll(".task__textarea")
      .forEach((note, i) => {
        note.value = notesArr[i];
      });
  }

  loadUserPreferences() {
    // bring menu back to page's z-index:
    document.querySelector(".menu").style.zIndex = 10;

    // Show HTML after loading setings finish.
    document.querySelector(".main").style.display = "block";

    let dataJSON = localStorage.getItem("data");
    if (!dataJSON) return;
    const data = JSON.parse(dataJSON);

    if (!data.version) {
      this.resetUserPreferences();
      view._version = data.version = 1;
    }

    console.log(data);

    view._version = data.version;

    if (data.notificationUserResponseState) {
      view._notificationsState = data.notificationsState;
      view._notificationUserResponseState = data.notificationUserResponseState;
    }

    view._autoStartPomo = data.loopPomo;
    view._removeTasks = data.removeTasks;
    view._buttonSounds = data.buttonSounds;
    view._timeLeft = data.pomoLength;
    view._timePomo = data.pomoLength;
    view._timeShortBreak = data.shortBreakLength;
    view._timeLongBreak = data.longBreakLength;
    view._currentTheme = data.theme;
    view._day = data.day;
    view._timeStudiedToday = data.timeStudiedToday;
    view._sessionsToday = data.sessionsToday;
    view._timeStudiedAllTime = data.timeStudiedAllTime;

    // Turning display into pomo time set in last session:
    view._display.textContent = `${view._timeLeft
      .toString()
      .padStart(2, "0")}:00`;

    // Little trick: 0 minutes added.
    this.addToAnalytics(0);

    // Insert saved tasks:
    if (data.openTasksContainerMarkup) {
      view._openTasksContainer.innerHTML = data.openTasksContainerMarkup;
      this._loadOpenTasksContainerNotes(data.taskNotes);
    }

    // APPLIES ALL CODE WRITTEN ABOVE TO EACH SETTING.
    const headings = document.querySelectorAll(".menu__heading");
    headings.forEach((heading) => {
      const icon = heading.nextElementSibling.querySelector(".icon");
      if (!icon) {
        const input = heading.nextElementSibling;
        if (!input) return;

        if (heading.textContent === "Pomodoro") {
          input.placeholder = view._timePomo;
          return;
        }
        if (heading.textContent === "Short break") {
          input.placeholder = view._timeShortBreak;
          return;
        }
        if (heading.textContent === "Long break") {
          input.placeholder = view._timeLongBreak;
          return;
        }

        return;
      }

      // Removing the tick by default for all menu headings:
      icon.classList.remove("completed");

      if (heading.textContent === "Loop pomo & break") {
        if (view._autoStartPomo === true) {
          icon.classList.add("completed");
          return;
        }
      }
      if (heading.textContent === "Remove tasks") {
        if (view._removeTasks === true) {
          icon.classList.add("completed");
          document.querySelector(".tasks").classList.add("hidden");
          return;
        }
      }
      if (heading.textContent === "Button sounds") {
        if (view._buttonSounds === true) {
          icon.classList.add("completed");
          return;
        }
      }
      if (heading.textContent === "Allow notifications") {
        if (view._notificationsState === true) {
          icon.classList.add("completed");
          return;
        }
      }
      if (heading.textContent === view._currentTheme) {
        icon.classList.add("completed");
        document.body.classList.add(heading.textContent.toLowerCase());
      }
    });
  }

  resetUserPreferences() {
    localStorage.setItem("data", "");
  }
}
