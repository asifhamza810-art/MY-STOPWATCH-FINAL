import react from "react";
import { useState, useEffect } from "react";
import axios from "axios";

function Todo() {
    const [todo, setTodo] = useState({
        text: "",
        completed: false
    });

    const [todos, setTodos] = useState([]);
    const [editIndex, setEditIndex] = useState(null);

    useEffect(() => {
        axios.get("http://localhost:5000/api/todos")
            .then((response) => {
                setTodos(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    async function addTodo() {
        if (!todo.text.trim()) return;

        try {
            if (editIndex !== null) {
                const todoToEdit = todos[editIndex];

                await updateTodo(todoToEdit._id, {
                    text: todo.text,
                    completed: todo.completed
                });

                return;
            }

            const response = await axios.post(
                "http://localhost:5000/api/todos",
                {
                    text: todo.text
                }
            );

            setTodos((prevTodos) => [
                ...prevTodos,
                response.data
            ]);

            setTodo({
                text: "",
                completed: false
            });

        } catch (error) {
            console.log("Todo operation failed:", error);
        }
    }

    async function deleteTodo(id) {
        try {
            await axios.delete(
                `http://localhost:5000/api/todos/${id}`
            );

            setTodos((prevTodos) =>
                prevTodos.filter((todo) => todo._id !== id)
            );

        } catch (error) {
            console.log("Delete failed:", error);
        }
    }

    async function updateTodo(id, updatedData) {
        try {
            const response = await axios.put(
                `http://localhost:5000/api/todos/${id}`,
                updatedData
            );

            setTodos((prevTodos) =>
                prevTodos.map((todo) =>
                    todo._id === id ? response.data : todo
                )
            );

            setTodo({
                text: "",
                completed: false
            });

            setEditIndex(null);

        } catch (error) {
            console.log("Update failed:", error);
        }
    }

    async function handleComplete(todo) {
        try {
            const response = await axios.put(
                `http://localhost:5000/api/todos/${todo._id}`,
                {
                    text: todo.text,
                    completed: !todo.completed
                }
            );

            setTodos((prevTodos) =>
                prevTodos.map((item) =>
                    item._id === todo._id ? response.data : item
                )
            );

        } catch (error) {
            console.log("Complete update failed:", error);
        }
    }

    return (
        <>
            <input
                value={todo.text}
                onChange={(e) =>
                    setTodo({
                        ...todo,
                        text: e.target.value
                    })
                }
                placeholder="Enter your Task"
            />

            <button onClick={addTodo}>
                {editIndex !== null ? "Update Task" : "Add Task"}
            </button>

            {todos.map((todo) => (
                <div key={todo._id}>
                    <h1>{todo.text}</h1>

                    <button
                        onClick={() => {
                            setTodo({
                                text: todo.text,
                                completed: todo.completed
                            });

                            setEditIndex(todos.indexOf(todo));
                        }}
                    >
                        <h4>EDIT</h4>
                    </button>

                    <button onClick={() => deleteTodo(todo._id)}>
                        <h4>DELETE</h4>
                    </button>

                    <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleComplete(todo)}
                    />
                </div>
            ))}
        </>
    );
}

export default Todo;