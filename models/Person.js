require('dotenv').config();
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// console.log('process.env.MONGO_URI :>> ', process.env.MONGO_URI);
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log('connected to database'))
  .catch((err) => console.log(err));

const personSchema = new mongoose.Schema({
  name: { type: String, unique: true, minLength: 3 },
  number: { type: String, minLength: 8 },
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

personSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Person', personSchema, 'phonebook');
