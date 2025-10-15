// todolistapiwithmongoDB-advanced.js

const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());



mongoose
  .connect("mongodb://127.0.0.1:27017/todoDB")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));



const todoSchema = new mongoose.Schema(
  {
    task: [
      {
        name: { type: String, required: true, index: true }, // 🔹 Index on name
        completed: { type: Boolean, default: false }
      }
    ],
    createdAt: { type: Date, default: Date.now }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);


todoSchema.virtual("taskCount").get(function () {
  return this.tasks.length;
});


todoSchema.pre("save", function (next) {
  console.log("📌 A new Todo is being saved:", this.tasks);
  next();
});


const Todo = mongoose.model("Todo", todoSchema);


const TodoRepository = {
  async create(todoData) {
    const todo = new Todo(todoData);
    return await todo.save();
  },

  async findAll({ page = 1, limit = 5, search = "" }) {
    const query = search
      ? { "tasks.name": { $regex: search, $options: "i" } }
      : {};
    const todos = await Todo.find(query)
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Todo.countDocuments(query);
    return { todos, total, page, totalPages: Math.ceil(total / limit) };
  },

  async findById(id) {
    return await Todo.findById(id);
  },

  async update(id, updatedData) {
    return await Todo.findByIdAndUpdate(id, updatedData, { new: true });
  },

  async delete(id) {
    return await Todo.findByIdAndDelete(id);
  }
};



app.get("/todos", async (req, res) => {
  const { page, limit, search } = req.query;
  const result = await TodoRepository.findAll({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 5,
    search: search || ""
  });
  res.json(result);
});

app.post("/todos", async (req, res) => {
  try {
    const todo = await TodoRepository.create(req.body);
    res.status(201).json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/todos/:id", async (req, res) => {
  const todo = await TodoRepository.findById(req.params.id);
  if (todo) res.json(todo);
  else res.status(404).json({ message: "Todo not found" });
});

app.put("/todos/:id", async (req, res) => {
  const todo = await TodoRepository.update(req.params.id, req.body);
  if (todo) res.json(todo);
  else res.status(404).json({ message: "Todo not found" });
});

app.delete("/todos/:id", async (req, res) => {
  const todo = await TodoRepository.delete(req.params.id);
  if (todo) res.json(todo);
  else res.status(404).json({ message: "Todo not found" });
});



app.listen(3000, () => console.log("Server running at http://localhost:3000/todos"));
