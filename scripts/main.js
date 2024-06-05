"use strict";

//IIFE
(async function () {
  const apiUrl = "http://localhost:3081";
  const todoList = await fetch(`${apiUrl}/todos`).then((res) => res.json());
  let isReversed = await fetch(`${apiUrl}/settings`).then((res) => res.json()).then((data) => data.isReversed);

  const modal = document.querySelector("#congratulations-modal");
  const closeButton = document.querySelector(".close-button");

  document
    .querySelector("[data-todos-form]")
    .addEventListener("submit", handleAddTodo);
  document
    .querySelector("[data-todos-list]")
    .addEventListener("click", handleDeleteTodo);
  document
    .querySelector("[data-todos-list]")
    .addEventListener("change", handleUpdateTodo);
  document
    .querySelector("#reverseTodos")
    .addEventListener("click", handleReversedList);
  document
    .addEventListener("click", handleCloseModal);
  closeButton
    .addEventListener("click", hideModal);

  displayTodos();

  async function handleUpdateTodo(e) {
    const todoId = e.target.value;
    const isCompleted = e.target.checked;

    const res = await fetch(`${apiUrl}/todos/${todoId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: `{"completed": ${isCompleted}}`,
    });

    if (!res.ok) {
      e.target.checked = !e.target.checked;
    }
  }

  async function handleAddTodo(e) {
    e.preventDefault();
    const title = getTodoTitleFromForm(e.target);

    if (!title) return;

    await addToTodoList(title);
  }

  async function handleDeleteTodo(e) {
    const btn = e.target.closest("[data-delete-todo]");
    if (!btn) return;

    await fetch(`${apiUrl}/todos/${btn.dataset.todoId}`, {
      method: "DELETE",
    });

    const index = todoList.findIndex((todo) => todo.id === btn.dataset.todoId);
    todoList.splice(index, 1);
  }

  async function addToTodoList(title) {
    const newTodo = await fetch(`${apiUrl}/todos`, {
      method: "POST",
      body: JSON.stringify({ title, completed: false }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());

    todoList.push(newTodo);
  }

  async function handleReversedList() {
    isReversed = !isReversed;

    await fetch("http://localhost:3081/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: `{ "isReversed": ${isReversed} }`,
    });
  }

  function getTodoTitleFromForm(form) {
    const data = new FormData(form);
    return data.get("title");
  }

  function updateCompletionCircle(percentage) {
    const progressBar = document.querySelector(".progress-bar");
    const progressText = document.getElementById("progress-text");
    const circumference = 2 * Math.PI * 45; // 2 * π * r (circumference of the circle)
    const offset = circumference - (percentage / 100) * circumference;

    progressBar.style.strokeDashoffset = offset;
    progressText.textContent = `${renderPercentage(percentage)}%`;

    congratulationsMsg(percentage);
  }

  function calculateCompletionPercentage() {
    const completedCount = todoList.filter((todo) => todo.completed).length;
    return (completedCount / todoList.length) * 100;
  }

  function renderPercentage(percentage) {
    if (Number.isInteger(percentage)) {
      return percentage;
    }
    return percentage.toFixed(2);
  }

  function congratulationsMsg(percentage) {
    if (percentage === 100) {
      showModal();
    }
  }

  function buildTodoItems(todos) {
    const fragment = document.createDocumentFragment();
    for (const todo of todos) {
      const item = document.createElement("li");
      const label = document.createElement("label");
      const titleLabel = document.createElement("label");
      const check = document.createElement("input");
      const deleteBtn = document.createElement("button");

      item.classList = "item";

      deleteBtn.type = "button";
      deleteBtn.innerHTML = "&times;";
      deleteBtn.dataset.deleteTodo = true;
      deleteBtn.dataset.todoId = todo.id;
      deleteBtn.classList = "delete-button";

      check.type = "checkbox";
      check.checked = todo.completed;
      check.value = todo.id;

      check.classList = "check";

      titleLabel.append(todo.title);

      label.append(check, titleLabel);
      item.append(label, deleteBtn);
      fragment.append(item);
    }

    const completionPercentage = calculateCompletionPercentage();
    updateCompletionCircle(completionPercentage);

    return fragment;
  }

  function displayTodos() {
    const list = document.querySelector("[data-todos-list]");
    list.innerHTML = "";
    const todosToDisplay = isReversed ? [...todoList].reverse() : todoList;
    const itemsFragment = buildTodoItems(todosToDisplay);

    list.appendChild(itemsFragment);
    changeReverseBtnColor(isReversed);
  }

  function changeReverseBtnColor(isReversed) {
    const reverseBtn = document.querySelector("#reverseTodos");

    if (isReversed) {
      reverseBtn.style.background = "#0a1c3d";
      reverseBtn.style.color = "#fff";
    }
  }

  function showModal() {
    modal.style.display = "block";
  }

  function hideModal() {
    modal.style.display = "none";
  }

  function handleCloseModal(e) {
    if (e.target === modal) {
      hideModal();
    }
  }
})();
