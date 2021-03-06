const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const express = require('express');
const { Genre, validate } = require('../models/genre');
const router = express.Router();

router.get('/', async (req, res) => {
  const genres = await Genre.find().sort('name');
  res.send(genres);
});

router.get('/:id', async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (genre) {
    return res.status(404).send('Genre is not found');
  }
  res.send(genre);
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error);
  }
  let genre = await Genre.findOne({ name: req.body.name });
  if (genre) {
    return res.status(400).send({ message: 'Genre already exist.' });
  }
  genre = new Genre({ name: req.body.name });
  await genre.save();
  return res.send(genre);
});

router.put('/:id', async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error);
  }
  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }
  );
  if (!genre) {
    return res.status(404).send('Genre is not found');
  }
  res.send(genre);
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const genre = await Genre.findByIdAndRemove(req.params.id);
  if (!genre) {
    return res.status(404).send('Genre is not found');
  }
  res.send(genre);
});

module.exports = router;
