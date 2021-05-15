// require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

const Person = require('./models/Person.js');

morgan.token('body', (req, res) => JSON.stringify(req.body));

app.use(express.static('build'));
app.use(cors());
app.use(express.json());
app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      tokens.body(req, res),
    ].join(' ');
  })
);

app
  .route('/api/persons')
  .get((req, res) => {
    Person.find({}).then((result) => {
      const doc = result.map((ele) => ele.toJSON());
      // console.log('doc :>> ', doc);
      return res.json(doc);
    });
  })
  .post((req, res, next) => {
    if (!req.body.name || !req.body.number) {
      return res.status(400).json({
        error: 'missing required field(s)',
      });
    }
    // if (
    //   phonebook.find((ele) => {
    //     // console.log('--------------------------------');
    //     // console.log('ele.name :>> ', ele.name);
    //     // console.log('req.body.name :>> ', req.body.name);
    //     return ele.name === req.body.name;
    //   })
    // ) {
    //   return res.status(400).json({
    //     error: 'the name is already in phonebook',
    //   });
    // }
    // const newObj = {
    //   ...req.body,
    //   id: Math.floor(Math.random() * 1000000),
    // };
    // phonebook = phonebook.concat(newObj);
    // // console.log('phonebook :>> ', phonebook);
    const person = new Person({ ...req.body });

    person
      .save()
      .then((result) => res.status(201).json(result.toJSON()))
      .catch((err) => next(err));
  });

app
  .route('/api/persons/:id')
  .get((req, res, next) => {
    Person.findById(req.params.id)
      .then((result) => {
        if (result) {
          console.log('result.toJSON() :>> ', result.toJSON());
          return res.json(result.toJSON());
        }
        res.status(404).end();
      })
      .catch((err) => next(err));
  })
  .delete((req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
      .then((result) => res.status(204).end())
      .catch((err) => next(err));
  })
  .put((req, res, next) => {
    console.log('req.body :>> ', req.body);
    Person.findByIdAndUpdate(
      req.params.id,

      req.body,

      { runValidators: true, new: true, context: 'query' }
    )
      .then((result) => res.json(result.toJSON()))
      .catch((err) => next(err));
  });

app.get('/info', (req, res, next) => {
  Person.countDocuments({})
    .then((num) => {
      res.send(`<div>
    <p>Phonebook has info for ${num} people</p>
    <p>${new Date().toString()}</p>
    </div>`);
    })
    .catch((err) => next(err));
});

//error handling

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

// handler of requests with unknown endpoint
app.use(unknownEndpoint);

const errorHandler = (err, req, res, next) => {
  console.error(err.message);

  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  } else if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  next(err);
};

// this has to be the last loaded middleware.
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`server is listen on port ${PORT}`));
