const express = require('express');
const auth = require('../middleware/auth');
const { Customer, validate } = require('../models/customer');
const router = express.Router();

router.get('/', async (req, res) => {
  const customers = await Customer.find().sort('name');
  res.send(customers);
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error);
  }
  const customer = new Customer({
    isGold: req.body.isGold,
    name: req.body.name,
    phone: req.body.phone,
  });
  await customer.save();
  res.send(customer);
});

router.put('/:id', async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error);
  }
  const customer = await Customer.findByIdAndUpdate(req.params.id, {
    isGold: req.body.isGold,
    name: req.body.name,
    phone: req.body.phone,
  });
  if (!customer) {
    return res.status(404).send('Customer with given id is not found');
  }
  res.send(customer);
});

router.delete('/:id', async (req, res) => {
  const customer = await Customer.findByIdAndRemove(req.params.id);
  if (!customer) {
    return res.status(404).send('Customer with given id is not found');
  }
  res.send(customer);
});

router.get('/:id', async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return res.status(404).send('Customer with given id is not found');
  }
  res.send(customer);
});

module.exports = router;
