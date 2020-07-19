const { Rental, validate } = require('../models/rental');
const { Movie } = require('../models/movie');
const { Customer } = require('../models/customer');
const mongoose = require('mongoose');
const Fawn = require('fawn');
const auth = require('../middleware/auth');
const express = require('express');
const { copyFile } = require('fs');
const router = express.Router();
Fawn.init(mongoose);

router.get('/', async (req, res) => {
  const rentals = await Rental.find().sort('-dateOut');
  res.send(rentals);
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error);
  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send('Customer not found.');
  let movie = await Movie.findById(req.body.movieId);
  if (!movie) res.status(400).send('Movie not found.');
  if (movie.numberInStock === 0)
    return res.status(400).send('Movie not available for rent');
  const rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
  });
  // here these two db operation should happend , use transaction
  try {
    new Fawn.Task()
      .save('rentals', rental)
      .update(
        'movies',
        {
          _id: movie._id,
        },
        { $inc: { numberInStock: -1 } }
      )
      .run();
    res.send(rental);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/:id', async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental)
    return res.status(404).send('The rental with the given ID was not found.');
  return res.send(rental);
});

module.exports = router;
