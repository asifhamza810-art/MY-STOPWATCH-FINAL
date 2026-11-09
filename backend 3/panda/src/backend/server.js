const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());
const todoSchema = new mongoose.Schema(
  {

    text: {
     type: String,
      required: true,
       trim: true,
    },
completed: {
       type: Boolean,
     default: false,
    },
  },
  {
    timestamps: true,}
);

const Todo = mongoose.models.Todo || mongoose.model("Todo", todoSchema);
//tast
app.get("/", (req, res) => {
  res.send("Todo Backend API is running!");
});
//get
app.get("/api/todos", async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.status(200).json(todos);} catch (error) {
    res.status(500).json({
      message: "Failed to fetch todos",
      error: error.message,});}});
//post
app.post("/api/todos", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Todo text is required",      });
}
    const newTodo = await Todo.create({
      text: text.trim(),completed: false,
});
res.status(201).json(newTodo);
  }   catch (error) {
      res.status(500).json({
    message: "Failed to create todo",
      error: error.message,    });
}
});
//put
app.put("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { text, completed } = req.body;
    const updatedTodo = await Todo.findByIdAndUpdate(id,
    {
          text,
    completed,
    },      {
    new: true,
runValidators: true,});
    if (!updatedTodo) {
      return res.status(404).json({
        message: "Todo not found",});    }

res.status(200).json(updatedTodo);
  } catch (error) {    res.status(500).json({
     message: "Failed to update todo",
      error: error.message,    });
}
});
// delet
app.delete("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTodo = await Todo.findByIdAndDelete(id);
    if (!deletedTodo) {
      return res.status(404).json({
        message: "Todo not found", });
    }
    res.status(200).json({
      message: "Todo deleted successfully",
      todo: deletedTodo,    });
  } catch (error) {res.status(500).json({
      message: "Failed to delete todo",error: error.message,
  });
  }
});

// mongo db connect

const PORT = process.env.PORT || 5000;
mongoose
.connect(process.env.MONGO_URI)
.then(() => {    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
.catch((error) => {
    console.error("MongoDB connection failed:", error.message);  });
