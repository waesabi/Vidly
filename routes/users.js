const _ = require('lodash');
const bcrypt = require('bcrypt');
const { User, validate } = require('../models/user');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error);
  let user = await User.findOne({
    email: req.body.email,
  });
  if (user) return res.status(400).send('User already registered.');
  user = new User(_.pick(req.body, ['name', 'email', 'password']));

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);
  user.password = hash;
  await user.save();
  return res.send(_.pick(user, ['_id', 'name', 'email']));
});
// we can use password complexity - npm i joi-password-complexity

module.exports = router;
