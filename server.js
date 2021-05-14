var phonebook = [
  {
    name: 'Arto Hellas',
    number: '040-123456',
    id: 1,
  },
  {
    name: 'Ada Lovelace',
    number: '39-44-5323523',
    id: 2,
  },
  {
    name: 'Dan Abramov',
    number: '12-43-234345',
    id: 3,
  },
  {
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
    id: 4,
  },
  {
    name: 'lol-pallo',
    number: '1',
    id: 6,
  },
  {
    name: 'Juha',
    number: '123123',
    id: 8,
  },
];
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

morgan.token('body', (req, res) => JSON.stringify(req.body));

app.use(express.json());
app.use(cors());
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
app.use(express.static('build'));

app
  .route('/api/persons')
  .get((req, res) => {
    res.json(phonebook);
  })
  .post((req, res) => {
    if (!req.body.name || !req.body.number) {
      return res.status(400).json({
        error: 'missing required field(s)',
      });
    }
    if (
      phonebook.find((ele) => {
        // console.log('--------------------------------');
        // console.log('ele.name :>> ', ele.name);
        // console.log('req.body.name :>> ', req.body.name);
        return ele.name === req.body.name;
      })
    ) {
      return res.status(400).json({
        error: 'the name is already in phonebook',
      });
    }
    const newObj = {
      ...req.body,
      id: Math.floor(Math.random() * 1000000),
    };
    phonebook = phonebook.concat(newObj);
    // console.log('phonebook :>> ', phonebook);
    res.status(201).json(newObj);
  });

app
  .route('/api/persons/:id')
  .get((req, res) => {
    const doc = phonebook.find((ele) => {
      return ele.id === Number(req.params.id);
    });
    if (doc) {
      console.log('doc :>> ', doc);
      return res.json(doc);
    }
    return res.status(404).send('404 not found');
  })
  .delete((req, res) => {
    phonebook = phonebook.filter((ele) => ele.id !== Number(req.params.id));
    res.status(204).end();
  });

app.get('/info', (req, res) => {
  res.send(`<div>
    <p>Phonebook has info for ${phonebook.length} people</p>
    <p>${new Date().toString()}</p>
    </div>`);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`server is listen on port ${PORT}`));
