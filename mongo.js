const mongoose = require('mongoose');

if (process.argv.length < 2) {
  console.log(
    'Please provide all the required field(s): node mongo.js <password>'
  );
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://admin:${password}@cluster0.7z6xo.mongodb.net/database?retryWrites=true&w=majority`;

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});
//   .then(() => console.log('connected to database'))
//   .catch((err) => console.log(err));

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema, 'phonebook');

if (process.argv.length > 3) {
  const doc = new Person({
    name: process.argv[3],
    number: process.argv[4],
  });

  doc.save().then((result) => {
    console.log(
      `added ${process.argv[3]} number ${process.argv[4]} to phonebook`
    );
    mongoose.connection.close();
  });
} else {
  Person.find({}).then((result) => {
    console.log('phonebook:');
    result.forEach((person) => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  });
}
