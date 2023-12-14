import view from "./view.js";

class taskView extends view {
  addTaskContainerHandler() {
    const openTasksButton = document.querySelector(".open-tasks");
    openTasksButton.addEventListener("click", (e) => {
      document
        .querySelector(".open-tasks__container")
        .classList.toggle("hidden");

      openTasksButton.querySelector(".icon").classList.toggle("open");

      // for when the top task button is clicked and then it focuses on the input. (change location)
      const taskTitleInput = document.querySelector(".add-task__input");

      if (view._deviceType === "Desktop") taskTitleInput.focus();
    });

    const openTasksContainer = document.querySelector(".open-tasks__container");
    openTasksContainer.addEventListener("keyup", () => {
      this._saveOpenTasksContainerNotes();
    });

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
        const deleteButton = checkBox
          .closest(".task")
          .querySelector(".delete-task-button");
        const task = icon.closest(".task");

        if (icon.classList.contains("completed")) {
          icon.classList.remove("completed"); // unticks a ticked box.
          headingText.style.color = "var(--secondary-color-retro)";
          headingIcon.style.color = "var(--secondary-color-retro)";
          icon.style.color = "transparent";
          checkBox.style.border = "3px solid var(--secondary-color-retro)";
          this._saveUserPreferences();
          return;
        } else {
          icon.classList.add("completed"); // ticks an unticked box.
          headingText.style.color = "var(--secondary-color-retro--darker)";
          headingIcon.style.color = "var(--secondary-color-retro--darker)";
          headingIcon.classList.remove("open");
          icon.style.color = "var(--secondary-color-retro--darker)";
          checkBox.style.border =
            "3px solid var(--secondary-color-retro--darker)";
          textArea.classList.add("hidden");
          deleteButton.classList.add("hidden");
          task.style.marginBottom = "0";
          this._saveUserPreferences();
          return;
        }
      }

      // TOGGLE CANCEL BUTTON WHEN YOU COME BACK. thanks :)

      const taskHeadingButton = e.target.closest(".button-md");
      if (taskHeadingButton && taskHeadingButton.textContent !== "CANCEL") {
        const task = taskHeadingButton.closest(".task");
        const textArea = taskHeadingButton.parentElement.nextElementSibling;
        const deleteTaskButton = textArea.nextElementSibling;
        const taskHeadingIcon = taskHeadingButton.querySelector(".icon");

        textArea.classList.toggle("hidden");
        deleteTaskButton.classList.toggle("hidden");
        taskHeadingIcon.classList.toggle("open");

        // can be turned into a utility class.
        if (taskHeadingIcon.classList.contains("open"))
          task.style.marginBottom = "3.6rem";
        else task.style.marginBottom = "0";

        this._saveUserPreferences();
        return;
      }

      // DELETES A TASK /W IT'S NOTE.
      const deleteTaskButton = e.target.closest(".delete-task-button");
      if (deleteTaskButton) {
        deleteTaskButton.closest(".task").remove();
        this._saveUserPreferences();
      }

      // THERE IS ALWAYS JUST ONE FORM ON THE PAGE.
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
        this._saveUserPreferences();
        return;
      }

      if (e.target.closest(".add-task-button") === addTaskButton) {
        addTaskButton.classList.add("hidden");
        submitTaskButton.classList.remove("hidden");
        cancelTaskButton.classList.remove("hidden");
        addTaskForm.classList.remove("hidden");
        const taskTitleInput = document.querySelector(".add-task__input");
        if (view._deviceType === "Desktop") taskTitleInput.focus();
        this._saveUserPreferences();
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
      <button class="audioButton button-md">
      <i class="icon fi fi-bs-angle-small-down open"></i>
      <span class="heading-text">${taskInput.value}</span>
      </button>
      <button class="audioButton task__check">
      <i class="icon fi fi-bs-check"></i>
      </button>
      </div>
      <textarea
      class="task__textarea"
      placeholder="Add a note..."
      ></textarea>
      <button class="audioButton button-lg delete-task-button">DELETE TASK</button>
      </div>
      `;
        taskInput.value = "";
        taskForm.parentElement.insertAdjacentHTML("beforebegin", markup);

        const newTask = document.querySelectorAll(".task");
        const currentTask = Array.from(newTask).pop();
        const currentTextArea = currentTask.querySelector(".task__textarea");
        currentTextArea.focus();

        this._saveUserPreferences();
      })
    );
  }
}

export default new taskView();
