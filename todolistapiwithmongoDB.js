const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());


mongoose.connect("mongodb://127.0.0.1:27017/todoDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});



const todoSchema = new mongoose.Schema({
  task: { type: String, required: true },
});
const Todo = mongoose.model("Todo", todoSchema);




class TodoRepository {
  async getAll() {
    return await Todo.find();
  }

  async getById(id) {
    return await Todo.findById(id);
  }

  async create(task) {
    const todo = new Todo({ task });
    return await todo.save();
  }

  async update(id, task) {
    return await Todo.findByIdAndUpdate(id, { task }, { new: true });
  }

  async delete(id) {
    return await Todo.findByIdAndDelete(id);
  }
}

const todoRepo = new TodoRepository();




app.get("/todos", async (req, res) => {
  try {
    const todos = await todoRepo.getAll();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single todo
app.get("/todos/:id", async (req, res) => {
  try {
    const todo = await todoRepo.getById(req.params.id);
    if (!todo) return res.status(404).json({ message: "Todo not found" });
    res.json(todo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create new todo
app.post("/todos", async (req, res) => {
  try {
    const newTodo = await todoRepo.create(req.body.task);
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update todo
app.put("/todos/:id", async (req, res) => {
  try {
    const updated = await todoRepo.update(req.params.id, req.body.task);
    if (!updated) return res.status(404).json({ message: "Todo not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete todo
app.delete("/todos/:id", async (req, res) => {
  try {
    const deleted = await todoRepo.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Todo not found" });
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(3000, () =>
  console.log("Server running at http://localhost:3000/todos")
);
