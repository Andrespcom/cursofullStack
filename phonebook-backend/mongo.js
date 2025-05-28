const mongoose = require("mongoose");

// Verifica que se pasó al menos la contraseña
if (process.argv.length < 3) {
  console.log("❌ Proporciona la contraseña como argumento");
  process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

// URI con la base de datos `phonebook` y el usuario creado en Atlas
const url = `mongodb+srv://phonebook_user:${password}@cluster0.nvi5u2z.mongodb.net/phonebook?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);

mongoose
  .connect(url)
  .then(() => {
    const personSchema = new mongoose.Schema({
      name: String,
      number: String,
    });

    const Person = mongoose.model("Person", personSchema);

    if (!name && !number) {
      // Listar todos los contactos
      return Person.find({}).then((result) => {
        console.log("📞 phonebook:");
        result.forEach((person) => {
          console.log(`${person.name} ${person.number}`);
        });
        mongoose.connection.close();
      });
    }

    if (!name || !number) {
      console.log("❌ Debes proporcionar ambos: nombre y número");
      mongoose.connection.close();
      return;
    }

    // Guardar nuevo contacto
    const person = new Person({ name, number });

    return person.save().then(() => {
      console.log(`✅ added ${name} number ${number} to phonebook`);
      mongoose.connection.close();
    });
  })
  .catch((error) => {
    console.error("❌ Error conectando a MongoDB:", error.message);
    process.exit(1);
  });
