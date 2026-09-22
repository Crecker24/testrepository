export const dayNames = {
    mon: "ПН", tue: "ВТ", wed: "СР", thu: "ЧТ", fri: "ПТ", sat: "СБ", sun: "ВС"
};

export const goalRu = {
    health: "Здоровье", study: "Учёба", work: "Работа", food: "Питание"
};

export function getDayKey(date) {
    return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][date.getDay()];
}

export function getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function compareDates(date, today = new Date()) {
    const firstDate = new Date(date);
    const secondDate = new Date(today);
    firstDate.setHours(0, 0, 0, 0);
    secondDate.setHours(0, 0, 0, 0);
    if (firstDate < secondDate) return "past";
    if (firstDate > secondDate) return "future";
    return "today";
}

export function addDays(date, amount) {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
}

export function getMonday(date) {
    const monday = new Date(date);
    const day = monday.getDay();
    monday.setDate(monday.getDate() + (day === 0 ? -6 : 1 - day));
    monday.setHours(0, 0, 0, 0);
    return monday;
}

export function formatRepeatDays(days) {
    if (days.length === 7) return "ежедневно";
    return days.map((day) => dayNames[day]).join(", ");
}

export function isHabitActiveOnDate(habit, date) {
    return getDateKey(date) >= habit.createdAt;
}

export function getCompletionForDate(habits, date = new Date()) {
  const dayKey = getDayKey(date);
  const dateKey = getDateKey(date);

  const plannedHabits = habits.filter((habit) =>
    habit.days.includes(dayKey) &&
    isHabitActiveOnDate(habit, date)
  );

  const completedHabits = plannedHabits.filter((habit) =>
    habit.completedDates?.includes(dateKey) ?? false
  );

  return {
    completedHabits: completedHabits.length,
    plannedHabits: plannedHabits.length
  };
}