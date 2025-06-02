require("dotenv").config();
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const url = process.env.MONGODB_URI;

mongoose
  .connect(url)
  .then(() => {
    console.log("✅ Conectado a MongoDB");

    // Luego de la conexión exitosa, continuar con el servidor
    startServer();
  })
  .catch((error) => {
    console.error("❌ Error conectando a MongoDB:", error.message);
  });

function startServer() {
  const express = require("express");
  const morgan = require("morgan");
  const cors = require("cors");
  const path = require("path");
  const Person = require("./models/persons");

  const app = express();

  // Middlewares
  app.use(cors());
  app.use(express.json());

  morgan.token("body", (req) =>
    req.method === "POST" ? JSON.stringify(req.body) : "",
  );
  app.use(
    morgan(
      ":method :url :status :res[content-length] - :response-time ms :body",
    ),
  );

  app.use(express.static(path.resolve(__dirname, "build")));

  // Rutas
  app.get("/api/persons", (req, res, next) => {
    Person.find({})
      .then((persons) => res.json(persons))
      .catch((error) => next(error));
  });

  app.post("/api/persons", (req, res, next) => {
    const { name, number } = req.body;

    if (!name || !number) {
      return res.status(400).json({ error: "name or number missing" });
    }

    const person = new Person({ name, number });

    person
      .save()
      .then((savedPerson) => res.json(savedPerson))
      .catch((error) => next(error));
  });

  app.delete("/api/persons/:id", (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
      .then(() => res.status(204).end())
      .catch((error) => next(error));
  });

  app.put("/api/persons/:id", (req, res, next) => {
    const { name, number } = req.body;

    Person.findByIdAndUpdate(
      req.params.id,
      { name, number },
      { new: true, runValidators: true, context: "query" },
    )
      .then((updatedPerson) => res.json(updatedPerson))
      .catch((error) => next(error));
  });

  app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "build", "index.html"));
  });

  app.use((error, req, res, next) => {
    console.error(error.message);
    if (error.name === "CastError") {
      return res.status(400).send({ error: "malformatted id" });
    }
    next(error);
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}
