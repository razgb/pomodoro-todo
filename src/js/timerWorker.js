onmessage = function (e) {
  let seconds = e.data.seconds;
  let timerState = e.data.timerState;
  let currentMode = e.data.currentMode;

  let currentLoop = 0;

  let timer = setInterval(() => {
    if (!timerState) {
      clearInterval(timer);
      // close();
      // console.log("Timer has been closed due to false timer state");
      return;
    }

    if (seconds === 0) return;

    --seconds;
    if (seconds === 0 && currentLoop === 0) {
      if (currentMode === "POMODORO") {
        currentMode = "SHORT BREAK";
      } else if (currentMode === "SHORT BREAK") {
        currentMode = "POMODORO";
      }
      //  else if (currentMode === 'LONG BREAK') {
      // }
      currentLoop++;
    }

    postMessage({
      seconds: seconds,
      timerState: timerState,
      currentMode: currentMode,
    });
  }, 1000);
};
