"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ----- SUPABASE — połączenie z bazą danych -----
// Klucze bierzemy z pliku .env.local (zmienne środowiskowe)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ----- TYPY -----
// Interface opisuje kształt jednego zadania (jak schemat JSON-a / tabela w Supabase)
interface Todo {
  id: number;
  text: string;
  done: boolean;
  priority: "low" | "medium" | "high";
}

// ----- KOMPONENT: Pojedyncze zadanie -----
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
        <input
          type="checkbox"
          checked={todo.done}
          onChange={() => onToggle(todo.id)}
          className="w-5 h-5 cursor-pointer"
        />
        <span className={todo.done ? "line-through text-gray-400" : "text-gray-800"}>
          {todo.text}
        </span>
        <span className="text-xs text-blue-500 ml-2">[{todo.priority}]</span>
      </div>
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
const AddTodoForm = ({ onAdd }: { onAdd: (text: string, priority: "low" | "medium" | "high") => void }) => {
  const [inputValue, setInputValue] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === "") return;
    onAdd(inputValue, priority);
    setInputValue("");
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
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
        className="px-3 py-2 border border-gray-300 rounded-lg text-gray-800"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
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
  // Stan — tablica zadań, zaczyna PUSTA (dane przyjdą z bazy!)
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  // ----- POBIERANIE DANYCH Z BAZY (jak GET request do API) -----
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const { data, error } = await supabase
          .from("todos")           // z tabeli "todos"
          .select("*")             // pobierz wszystkie kolumny
          .order("created_at", { ascending: false }); // najnowsze na górze

        if (error) throw error;
        if (data) setTodos(data);
      } catch (error) {
        console.log("Błąd pobierania:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, []);

  // ----- DODAWANIE (jak POST request / INSERT INTO) -----
  const addTodo = async (text: string, priority: "low" | "medium" | "high") => {
    try {
      const { data, error } = await supabase
        .from("todos")
        .insert({ text, done: false, priority })  // wstaw nowy wiersz
        .select()                                   // zwróć wstawiony wiersz (z id z bazy!)
        .single();                                  // zwróć jako obiekt, nie tablicę

      if (error) throw error;
      if (data) setTodos([data, ...todos]); // dodaj na początek listy
    } catch (error) {
      console.log("Błąd dodawania:", error);
    }
  };

  // ----- PRZEŁĄCZANIE DONE (jak PATCH request / UPDATE) -----
  const toggleTodo = async (id: number) => {
    // Znajdź aktualne zadanie żeby wiedzieć jaki jest obecny stan done
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    try {
      const { error } = await supabase
        .from("todos")
        .update({ done: !todo.done })  // zmień done na przeciwny
        .eq("id", id);                 // WHERE id = ...

      if (error) throw error;
      // Aktualizuj lokalny stan (żeby UI się odświeżył natychmiast)
      setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    } catch (error) {
      console.log("Błąd aktualizacji:", error);
    }
  };

  // ----- USUWANIE (jak DELETE request / DELETE FROM) -----
  const deleteTodo = async (id: number) => {
    try {
      const { error } = await supabase
        .from("todos")
        .delete()          // usuń wiersz
        .eq("id", id);     // WHERE id = ...

      if (error) throw error;
      setTodos(todos.filter((t) => t.id !== id));
    } catch (error) {
      console.log("Błąd usuwania:", error);
    }
  };

  // Filtrowanie
  const filteredTodos =
    filter === "all"
      ? todos
      : filter === "active"
      ? todos.filter((todo) => !todo.done)
      : todos.filter((todo) => todo.done);

  const activeTodosCount = todos.filter((todo) => !todo.done).length;

  // ----- LOADING STATE -----
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Ładowanie zadań z bazy...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Lista zadań
        </h1>
        <p className="text-center text-gray-400 text-sm mb-8">
          Połączono z Supabase
        </p>

        <div className="mb-6">
          <AddTodoForm onAdd={addTodo} />
        </div>

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

        {filteredTodos.length === 0 && (
          <p className="text-center text-gray-400 mt-8">
            Brak zadań do wyświetlenia
          </p>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          Pozostało zadań: {activeTodosCount}
        </p>
      </div>
    </main>
  );
}
