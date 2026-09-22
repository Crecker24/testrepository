import { compareDates, getCompletionForDate } from "./function.js";
import { loadHabits } from "./storage.js";

const calendarGrid = document.querySelector(".calendar-grid");
const previousButton = document.querySelector("#prev-month");
const nextButton = document.querySelector("#next-month");
const cardMonth = document.querySelector(".calendar-card-month");
const completedText = document.querySelector(".calendar-card-completed");
const progressBar = document.querySelector("#monthly-progress-bar");
const progressPercent = document.querySelector("#monthly-progress-bar-info");

const today = new Date();
let currentCalendarDate = new Date(today.getFullYear(), today.getMonth(), 1);

function renderMonthCalendar(date) {
    const habits = loadHabits();
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthName = date.toLocaleDateString("ru-RU", { month: "long" });
    cardMonth.textContent = `${monthName[0].toUpperCase() + monthName.slice(1)} ${year}`;
    calendarGrid.innerHTML = "";

    const firstDay = new Date(year, month, 1);
    const start = new Date(year, month, 1 - ((firstDay.getDay() + 6) % 7));
    const lastDay = new Date(year, month + 1, 0);
    const end = new Date(year, month, lastDay.getDate() + ((7 - lastDay.getDay()) % 7));
    const currentDate = new Date(start);
    let totalPlanned = 0;
    let totalCompleted = 0;

    while (currentDate <= end) {
        const day = document.createElement("li");
        const isOutsideMonth = currentDate.getMonth() !== month || currentDate.getFullYear() !== year;
        day.className = "calendar-day";
        day.innerHTML = `<p class="calendar-day-number">${currentDate.getDate()}</p>`;

        if (isOutsideMonth) {
            day.classList.add("calendar-day-outside-month");
        } else {
            const stats = getCompletionForDate(habits, currentDate);
            const status = compareDates(currentDate);
            if (status !== "future") {
                totalPlanned += stats.plannedHabits;
                totalCompleted += stats.completedHabits;
            }

            const isComplete = stats.plannedHabits > 0 && stats.completedHabits === stats.plannedHabits;
            const circleClass = status === "future" ? "next-circle" : stats.plannedHabits === 0 ? "not-planned-circle" : isComplete ? "completed-circle" : "not-completed-circle";
            const content = status === "future" ? "" : stats.plannedHabits === 0 ? "-" : isComplete ? "" : `${stats.completedHabits}/${stats.plannedHabits}`;
            if (status === "today") day.classList.add("calendar-day-current");
            day.insertAdjacentHTML("beforeend", `<div class="circle-wrapper"><div class="circle ${circleClass}"><span class="circle-description">${content}</span></div></div>`);
        }

        calendarGrid.append(day);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    const percent = totalPlanned === 0 ? 0 : Math.round(totalCompleted / totalPlanned * 100);
    completedText.textContent = `${totalCompleted} из ${totalPlanned} запланированных действий выполнено`;
    progressBar.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;
}

previousButton.addEventListener("click", () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderMonthCalendar(currentCalendarDate);
});

nextButton.addEventListener("click", () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderMonthCalendar(currentCalendarDate);
});

renderMonthCalendar(currentCalendarDate);
