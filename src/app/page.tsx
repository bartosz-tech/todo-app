"use client";

import { useState } from "react";

// ----- TYPY -----
// Interface opisuje kształt jednego zadania (jak schemat JSON-a)
interface Todo {
  id: number;
  text: string;
  done: boolean;
  priority: "low" | "medium" | "high";
}

// ----- KOMPONENT: Pojedyncze zadanie -----
// Props: todo (dane zadania), onToggle (funkcja do oznaczania), onDelete (funkcja do usuwania)
const TodoItem = ({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}) => {
  return (
    <li className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-3">
        {/* Checkbox — kliknięcie wywołuje onToggle z id tego zadania */}
        <input
          type="checkbox"
          checked={todo.done}
          onChange={() => onToggle(todo.id)}
          className="w-5 h-5 cursor-pointer"
        />
        {/* Tekst zadania — przekreślony jeśli done === true */}
        <span className={todo.done ? "line-through text-gray-400" : "text-gray-800"}>
          {todo.text}
        </span>
<span className="text-xs text-blue-500 ml-2">[{todo.priority}]</span>
      </div>
      {/* Przycisk usuwania */}
      <button
        onClick={() => onDelete(todo.id)}
        className="text-red-400 hover:text-red-600 text-sm px-2 py-1 rounded hover:bg-red-50"
      >
        Usuń
      </button>
    </li>
  );
};

// ----- KOMPONENT: Formularz dodawania -----
const AddTodoForm = ({ onAdd }: { onAdd: (text: string) => void }) => {
  const [inputValue, setInputValue] = useState("");

  // Funkcja obsługująca wysłanie formularza
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Zapobiega przeładowaniu strony
    if (inputValue.trim() === "") return; // Nie dodawaj pustych zadań
    onAdd(inputValue); // Wywołaj funkcję z rodzica, przekazując tekst
    setInputValue(""); // Wyczyść pole po dodaniu
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Dodaj nowe zadanie..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-800"
      />
      <button
        type="submit"
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Dodaj
      </button>
    </form>
  );
};

// ----- KOMPONENT GŁÓWNY: Cała aplikacja Todo -----
export default function Home() {
  // Stan — tablica zadań, zaczyna z przykładowymi danymi
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "Nauczyć się React test", done: false, priority: "high" },
    { id: 2, text: "Zbudować Todo App test", done: false, priority: "low" },
    { id: 3, text: "Ogarnąć Next.js test", done: false, priority: "medium" },
  ]);

  // Filtr — "all", "active", "done"
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  // ----- FUNKCJE (akcje na danych) -----

  // Dodawanie nowego zadania
  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now(), // unikalny id na podstawie czasu
      text: text,
      done: false,
      priority: "medium"
    };
    setTodos([...todos, newTodo]); // [...todos] = kopia obecnej tablicy + nowy element
  };

  // Przełączanie done/undone
  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
    // Czytaj: "Przejdź po wszystkich zadaniach. Jeśli id pasuje — odwróć done. Resztę zostaw."
  };

  // Usuwanie zadania
  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
    // Czytaj: "Zostaw tylko te zadania, których id NIE jest równe podanemu."
  };

  // Filtrowanie — zwraca tablicę pasującą do wybranego filtra
  const filteredTodos =
    filter === "all"
      ? todos
      : filter === "active"
      ? todos.filter((todo) => !todo.done)
      : todos.filter((todo) => todo.done);

  // Statystyki
  const activeTodosCount = todos.filter((todo) => !todo.done).length;

  return (
    <main className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-lg mx-auto">
        {/* Nagłówek */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Lista zadań
        </h1>

        {/* Formularz dodawania */}
        <div className="mb-6">
          <AddTodoForm onAdd={addTodo} />
        </div>

        {/* Przyciski filtrów */}
        <div className="flex gap-2 mb-4">
          {(["all", "active", "done"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1 rounded-full text-sm ${
                filter === f
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {f === "all" ? "Wszystkie" : f === "active" ? "Aktywne" : "Zrobione"}
            </button>
          ))}
        </div>

        {/* Lista zadań */}
        <ul className="space-y-2">
          {filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          ))}
        </ul>

        {/* Pusta lista */}
        {filteredTodos.length === 0 && (
          <p className="text-center text-gray-400 mt-8">
            Brak zadań do wyświetlenia
          </p>
        )}

        {/* Statystyki na dole */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Pozostało zadań: {activeTodosCount}
        </p>
      </div>
    </main>
  );
}
