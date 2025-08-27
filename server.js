const http = require("http");

let books = [
  { id: 1, title: "1984", author: "George Orwell" },
  { id: 2, title: "The Hobbit", author: "J.R.R. Tolkien" }
];
let idCounter = books.length + 1;

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // GET /books
  if (req.url === "/books" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(books));
  }

  // POST /books
  if (req.url === "/books" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      const { title, author } = JSON.parse(body);
      const newBook = { id: idCounter++, title, author };
      books.push(newBook);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(newBook));
    });
    return;
  }

  // PUT /books/:id
  if (req.url.startsWith("/books/") && req.method === "PUT") {
    const id = parseInt(req.url.split("/")[2]);
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      const { title, author } = JSON.parse(body);
      const book = books.find(b => b.id === id);
      if (!book) {
        res.writeHead(404);
        return res.end("Book not found");
      }
      book.title = title;
      book.author = author;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(book));
    });
    return;
  }

  // DELETE /books/:id
  if (req.url.startsWith("/books/") && req.method === "DELETE") {
    const id = parseInt(req.url.split("/")[2]);
    books = books.filter(b => b.id !== id);
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Book deleted" }));
  }

  // Fallback for unknown routes
  res.writeHead(404);
  res.end("Not Found");
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
