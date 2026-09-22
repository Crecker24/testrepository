import { loadHabits, loadUserName, saveHabits, saveUserName } from "./storage.js";
import { addDays, compareDates, dayNames, formatRepeatDays, getCompletionForDate, getDateKey, getDayKey, getMonday, goalRu } from "./function.js";

const modal = document.querySelector("#habit-modal");
const openButton = document.querySelector("#open-form");
const closeButton = document.querySelector("#close-form");
const habitForm = document.querySelector("#habit-form");
const habitList = document.querySelector("#today-habits-list");
const weeklyCalendar = document.querySelector(".progress-calendar-list");
const goalList = document.querySelector("#goals-list");
const editNameButton = document.querySelector("#edit-btn");
const formMessage = document.querySelector("#form-message");
const nameModal = document.querySelector("#name-modal");
const nameForm = document.querySelector("#name-form");
const nameInput = document.querySelector("#user-name");

let habits = loadHabits();
let userName = loadUserName();
let selectedGoal = "all";

function getNextId() {
    return habits.length === 0 ? 1 : Math.max(...habits.map((habit) => habit.id)) + 1;
}

function getTodayHabits() {
    const todayKey = getDayKey(new Date());
    return habits.filter((habit) => habit.days.includes(todayKey) && (selectedGoal === "all" || habit.goal === selectedGoal));
}

function isCompletedToday(habit) {
    return habit.completedDates?.includes(getDateKey(new Date())) ?? false;
}

function toggleCompletion(habit) {
    const todayKey = getDateKey(new Date());
    habit.completedDates ??= [];
    const index = habit.completedDates.indexOf(todayKey);
    if (index === -1) habit.completedDates.push(todayKey);
    else habit.completedDates.splice(index, 1);
}

function renderGreeting() {
    const title = document.querySelector(".welcome-content-title");
    const subtitle = document.querySelector(".welcome-content-subtitle");
    if (!title || !subtitle) return;
    const hour = new Date().getHours();
    const greeting = hour < 5 ? "Доброй ночи" : hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";
    const date = new Date();
    const weekday = new Intl.DateTimeFormat("ru-RU", { weekday: "long" }).format(date);
    const month = new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(date);
    title.textContent = `${greeting}, ${userName || "гость"}`;
    subtitle.textContent = `${weekday[0].toUpperCase() + weekday.slice(1)}, ${date.getDate()} ${month} — маленькие шаги складываются в большой результат`;
}

function renderTodayProgress() {
    const stats = getCompletionForDate(habits);
    const percent = stats.plannedHabits === 0 ? 0 : Math.round(stats.completedHabits / stats.plannedHabits * 100);
    document.querySelector(".today-habits-completed").textContent = `${stats.completedHabits} из ${stats.plannedHabits} выполнено`;
    document.querySelector("#today-progress-bar").style.width = `${percent}%`;
    document.querySelector("#today-progress-bar-info").textContent = `${percent}%`;
}

function renderWeeklyProgress() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monday = getMonday(today);
    let completed = 0;
    let planned = 0;

    for (let index = 0; index < 7; index++) {
        const date = addDays(monday, index);
        if (date > today) break;
        const stats = getCompletionForDate(habits, date);
        completed += stats.completedHabits;
        planned += stats.plannedHabits;
    }

    const percent = planned === 0 ? 0 : Math.round(completed / planned * 100);
    document.querySelector(".progress-completed").textContent = `Выполнено ${completed} из ${planned} запланированных действий`;
    document.querySelector("#weekly-progress-bar").style.width = `${percent}%`;
    document.querySelector("#weekly-progress-bar-info").textContent = `${percent}%`;
}

function renderStreak() {
  const streakText = document.querySelector(".progress-streak-info");
  let date = new Date();
  let streak = 0;

  for (let index = 0; index < 365; index++) {
    const stats = getCompletionForDate(habits, date);

    if (
      stats.plannedHabits === 0 ||
      stats.completedHabits !== stats.plannedHabits
    ) {
      break;
    }

    streak++;
    date = addDays(date, -1);
  }

  streakText.textContent = `Серия выполнения привычек: ${streak} дней`;
}

function renderCurrentWeek() {
    weeklyCalendar.innerHTML = "";
    const today = new Date();
    const monday = getMonday(today);
    for (let index = 0; index < 7; index++) {
        const date = addDays(monday, index);
        const stats = getCompletionForDate(habits, date);
        const status = compareDates(date);
        const complete = stats.plannedHabits > 0 && stats.completedHabits === stats.plannedHabits;
        const item = document.createElement("li");
        item.className = "progress-calendar-list-item";
        if (status === "today") item.classList.add("progress-calendar-list-item-active");

        const content = status === "future" || stats.plannedHabits === 0
            ? '<span class="progress-calendar-next"></span>'
            : complete
                ? '<img class="progress-calendar-img" src="./img/checkmark.svg" alt="Все выполнено">'
                : `${stats.completedHabits}/${stats.plannedHabits}`;
        item.innerHTML = `<p class="progress-calendar-list-item-day-of-week">${dayNames[getDayKey(date)]}</p><div class="progress-calendar-img-wrapper ${complete ? "" : "progress-calendar-img-wrapper-failure"} ${status === "today" ? "progress-calendar-img-wrapper-active" : ""}">${content}</div><p class="progress-calendar-list-item-date ${status === "today" ? "" : "progress-calendar-list-item-date-previous"}">${date.getDate()}</p>`;
        weeklyCalendar.append(item);
    }
}

function renderHabits() {
    const todayHabits = getTodayHabits();
    habitList.innerHTML = "";
    if (!todayHabits.length) {
        habitList.innerHTML = '<li class="empty-state">На сегодня привычек нет.</li>';
    } else {
        todayHabits.forEach((habit) => {
            const card = document.createElement("li");
            const completed = isCompletedToday(habit);
            card.className = "today-habits-list-item";
            card.dataset.id = habit.id;
            card.innerHTML = `<div class="today-habits-list-item-wrapper"><p class="today-habits-list-item-title"></p><p class="today-habits-list-item-time"></p><p class="today-habits-list-item-goal goal-${habit.goal}"></p></div><button type="button" data-id="${habit.id}" class="completed-btn ${completed ? "completed-btn-active" : ""}" aria-label="Отметить привычку выполненной">${completed ? '<img src="./img/checkmark.svg" alt="">' : ""}</button>`;
            card.querySelector(".today-habits-list-item-title").textContent = habit.title;
            card.querySelector(".today-habits-list-item-time").textContent = `${habit.time} · ${formatRepeatDays(habit.days)}`;
            card.querySelector(".today-habits-list-item-goal").textContent = goalRu[habit.goal];
            habitList.append(card);
        });
    }
    renderTodayProgress();
    renderWeeklyProgress();
    renderCurrentWeek();
    renderStreak();
}

openButton.addEventListener("click", () => {
    clearFormMessage();
    habitForm.reset();
    modal.classList.add("is-open");
});
closeButton.addEventListener("click", () => modal.classList.remove("is-open"));
modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.classList.remove("is-open");
});

habitForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const days = [...document.querySelectorAll("input[name='days']:checked")].map((checkbox) => checkbox.value);
    if (!days.length) {
        showFormMessage("Выберите хотя бы один день выполнения.");
        return;
    };
    habits.push({
        id: getNextId(),
        title: document.querySelector("#habit-title").value.trim(),
        goal: document.querySelector("#habit-goal").value,
        days,
        time: document.querySelector("#habit-time").value,
        completedDates: [],
        createdAt: getDateKey(new Date())
    });
    try {
        saveHabits(habits);
        showFormMessage("Привычка успешно добавлена.", "success");
    } catch (error) {
        showFormMessage(error.message);
        return;
    }
    modal.classList.remove("is-open");
    renderHabits();
});

function showFormMessage(message) {
  formMessage.textContent = message;
  formMessage.hidden = false;
}

function clearFormMessage() {
  formMessage.textContent = "";
  formMessage.hidden = true;
}

habitList.addEventListener("click", (event) => {
    const button = event.target.closest(".completed-btn");
    if (!button) return;
    const habit = habits.find((item) => item.id === Number(button.dataset.id));
    if (!habit) return;
    toggleCompletion(habit);
    saveHabits(habits);
    renderHabits();
});

goalList.addEventListener("click", (event) => {
    const button = event.target.closest(".sidebar-goals-button");
    if (!button) return;
    selectedGoal = button.dataset.goal;
    renderHabits();
});

editNameButton.addEventListener("click", () => {
    const answer = prompt("Введите ваше имя", userName);
    if (!answer?.trim()) return;
    userName = answer.trim();
    saveUserName(userName);
    renderGreeting();
});

nameForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();

    if (name.length < 2) {
        return;
    }

    userName = name;
    saveUserName(userName);

    nameModal.classList.remove("is-open");
    renderGreeting();
});

if (!userName) {
    nameModal.classList.add("is-open");
    nameInput.focus();
}

renderGreeting();
renderHabits();
