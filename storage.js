const HABITS_KEY = "habits";
const USER_NAME_KEY = "userName";

export function loadHabits() {
    try {
        const savedHabits = localStorage.getItem(HABITS_KEY);
        const habits = savedHabits ? JSON.parse(savedHabits) : [];
        return Array.isArray(habits) ? habits : [];
    } catch {
        return [];
    }
}

export function saveHabits(habits) {
  try {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  } catch {
    throw new Error("Не удалось сохранить привычки в браузере.");
  }
}

export function loadUserName() {
    return localStorage.getItem(USER_NAME_KEY) || "";
}

export function saveUserName(name) {
    localStorage.setItem(USER_NAME_KEY, name.trim());
}
