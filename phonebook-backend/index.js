require('dotenv').config()
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");

const Person = require("./models/persons");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Morgan para loguear solicitudes, incluyendo el body en POST
morgan.token("body", (req) => {
  return req.method === "POST" ? JSON.stringify(req.body) : "";
});
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body"),
);

// Servir frontend desde carpeta build
app.use(express.static(path.resolve(__dirname, "build")));

// Datos en memoria
let persons = [
  { id: 1, name: "Arto Hellas", number: "040-123456" },
  { id: 2, name: "Ada Lovelace", number: "39-44-5323523" },
  { id: 3, name: "Dan Abramov", number: "12-43-234345" },
  { id: 4, name: "Mary Poppendieck", number: "39-23-6423122" },
];

// Rutas API
app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "name or number missing",
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);
  res.status(204).end();
});

app.put("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name, number } = req.body;
  const existing = persons.find((p) => p.id === id);
  if (!existing) {
    return res.status(404).json({ error: "person not found" });
  }

  const updatedPerson = { ...existing, number };
  persons = persons.map((p) => (p.id === id ? updatedPerson : p));
  res.json(updatedPerson);
});

// Última ruta: servir frontend si no coincide ninguna API
app.get("/*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "build", "index.html"));
});

// Inicio del servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
