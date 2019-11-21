const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');

const userSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['local', 'google'],
  },
  local: {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
      min: 5,
      max: 255,
    }
  },
  google: {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    googleId: {
      type: String,
    }
  },
});

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id, email: this.google.email || this.local.email }, config.get('jwtPrivateKey'));
  return token;
}

const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = {
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required()
  };
  return Joi.validate(user, schema);
}

function validateUserLogin(user) {
  const schema = {
    email: Joi.string().email().required(),
    password: Joi.string().required()
  };
  return Joi.validate(user, schema);
}


module.exports.userSchema = userSchema;
module.exports.User = User;
module.exports.validateUser = validateUser;
module.exports.validateUserLogin = validateUserLogin;