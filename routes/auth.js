const bcrypt = require('bcrypt');
const { User } = require('../models/user');
const Joi = require('@hapi/joi');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error);
  let user = await User.findOne({
    email: req.body.email,
  });
  if (!user) return res.status(400).send('Invalid or email password.');
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    res.status(400).send('Invalid or email password.');
  }
  res.send(true);
});
// we can use password complexity - npm i joi-password-complexity

function validate(req) {
  const schema = Joi.object({
    email: Joi.string().required().min(10).max(255).email(),
    password: Joi.string().required().min(5).max(255),
  });
  return schema.validate(req);
}

module.exports = router;
