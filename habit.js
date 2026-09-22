import { formatRepeatDays, getDateKey, goalRu } from "./function.js";
import { loadHabits, saveHabits } from "./storage.js";

const habitList = document.querySelector("#habits-list");
const filterList = document.querySelector("#filter-list");
const modal = document.querySelector("#habit-modal");
const form = document.querySelector("#habit-form");
const openButton = document.querySelector("#open-form");
const closeButton = document.querySelector("#close-form");
const submitButton = form.querySelector("button[type='submit']");
const formMessage = document.querySelector("#form-message");

let habits = loadHabits();
let selectedGoal = "all";
let editingHabitId = null;

function showFormMessage(message) {
  formMessage.textContent = message;
  formMessage.hidden = false;
}

function clearFormMessage() {
  formMessage.textContent = "";
  formMessage.hidden = true;
}

function getNextId() {
    return habits.length === 0 ? 1 : Math.max(...habits.map((habit) => habit.id)) + 1;
}

function getFilteredHabits() {
    return habits.filter((habit) => selectedGoal === "all" || habit.goal === selectedGoal);
}

function renderHabits() {
    const filteredHabits = getFilteredHabits();
    habitList.innerHTML = "";

    if (!filteredHabits.length) {
        const goalText = selectedGoal === "all" ? "" : ` в цели «${goalRu[selectedGoal]}»`;
        habitList.innerHTML = `<li class="empty-state">Привычек${goalText} пока нет.</li>`;
        return;
    }

    filteredHabits.forEach((habit) => {
        const card = document.createElement("li");
        card.className = "today-habits-list-item";
        card.dataset.id = habit.id;
        card.innerHTML = `<div class="today-habits-list-item-wrapper"><p class="today-habits-list-item-title"></p><p class="today-habits-list-item-time"></p><p class="today-habits-list-item-goal goal-${habit.goal}"></p></div><div class="all-habits-button-wrapper"><button type="button" class="habit-edit-btn habit-btn">Изменить</button><button type="button" class="habit-delete-btn habit-btn">Удалить</button></div>`;
        card.querySelector(".today-habits-list-item-title").textContent = habit.title;
        card.querySelector(".today-habits-list-item-time").textContent = `${habit.time} · ${formatRepeatDays(habit.days)}`;
        card.querySelector(".today-habits-list-item-goal").textContent = goalRu[habit.goal];
        habitList.append(card);
    });
}

function openCreateModal() {
    clearFormMessage();
    editingHabitId = null;
    form.reset();
    submitButton.textContent = "Добавить";
    modal.classList.add("is-open");
}

function openEditModal(id) {
    clearFormMessage();
    const habit = habits.find((item) => item.id === id);
    if (!habit) return;
    editingHabitId = id;
    document.querySelector("#habit-title").value = habit.title;
    document.querySelector("#habit-goal").value = habit.goal;
    document.querySelector("#habit-time").value = habit.time;
    document.querySelectorAll("input[name='days']").forEach((checkbox) => {
        checkbox.checked = habit.days.includes(checkbox.value);
    });
    submitButton.textContent = "Сохранить";
    modal.classList.add("is-open");
}

openButton.addEventListener("click", openCreateModal);
closeButton.addEventListener("click", () => modal.classList.remove("is-open"));
modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.classList.remove("is-open");
});

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const days = [...document.querySelectorAll("input[name='days']:checked")].map((checkbox) => checkbox.value);
    if (!days.length) {
        showFormMessage("Выберите хотя бы один день выполнения.");
        return;
    };

    const data = {
        title: document.querySelector("#habit-title").value.trim(),
        goal: document.querySelector("#habit-goal").value,
        days,
        time: document.querySelector("#habit-time").value
    };

    if (editingHabitId === null) {
        habits.push({
            id: getNextId(),
            ...data,
            completedDates: [],
            createdAt: getDateKey(new Date())
        });
    } else {
        const habit = habits.find((item) => item.id === editingHabitId);
        if (habit) Object.assign(habit, data);
    }

    saveHabits(habits);
    modal.classList.remove("is-open");
    renderHabits();
});

habitList.addEventListener("click", (event) => {
    const card = event.target.closest(".today-habits-list-item");
    if (!card) return;
    const id = Number(card.dataset.id);

    if (event.target.closest(".habit-edit-btn")) {
        openEditModal(id);
        return;
    }

    if (event.target.closest(".habit-delete-btn")) {
        const habit = habits.find((item) => item.id === id);
        if (!habit || !confirm(`Удалить привычку «${habit.title}»?`)) return;
        habits = habits.filter((item) => item.id !== id);
        saveHabits(habits);
        renderHabits();
    }
});

filterList.addEventListener("click", (event) => {
    const button = event.target.closest(".filter-button");
    if (!button) return;
    selectedGoal = button.dataset.goal;
    document.querySelectorAll(".filter-button").forEach((item) => item.classList.toggle("is-active", item === button));
    renderHabits();
});

renderHabits();