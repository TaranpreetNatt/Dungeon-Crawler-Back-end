const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const { User, validateUser, validateUserLogin } = require('../../models/user');


describe('user.generateAuthToken', () => {
  it('should return a valid json web token', () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
    }
    const user = new User(payload);
    const token = user.generateAuthToken();
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    expect(decoded).toMatchObject(payload);
  });
});

describe('validateUser', () => {

  const user = {
    name: 'test',
    email: 'email@domain.com',
    password: 'password@domain.com'
  }

  it('should not return an error if input is valid', () => {
    const result = validateUser(user);
    expect(result.error).toBeNull();
  });

  it('should return an error if name is missing', () => {
    user.name = '';
    const result = validateUser(user);
    expect(result.error).not.toBeNull();
  });

  it('should return an error if email is missing', () => {
    user.email = '';
    const result = validateUser(user);
    expect(result.error).not.toBeNull();
  });

  it('should return an error if email does not have @domain.com', () => {
    const user = {
      name: 'test',
      email: 'email',
      password: 'password'
    }
    const result = validateUser(user);
    expect(result.error).not.toBeNull();
  });

  it('should return an error if email has @ and not domain.com', () => {
    const user = {
      name: 'test',
      email: 'email@',
      password: 'password'
    }
    const result = validateUser(user);
    expect(result.error).not.toBeNull();
  });

  it('should return an error if password is missing', () => {
    user.password = '';
    const result = validateUser(user);
    expect(result.error).not.toBeNull();
  });
});

describe('validateUserLogin', () => {
  const user = {
    email: 'email@gmail.com',
    password: 'password'
  }

  it('should not return an error if input is valid', () => {
    const result = validateUserLogin(user);
    expect(result.error).toBeNull();
  });

  it('should return an error if password is missing', () => {
    user.password = '';
    const result = validateUserLogin(user);
    expect(result.error).not.toBeNull();
  });

  it('should return an error if email is missing', () => {
    user.email = '';
    const result = validateUserLogin(user);
    expect(result.error).not.toBeNull();
  });

  it('should return an error if email does not have @domain.com', () => {
    user.email = 'email';
    const result = validateUserLogin(user);
    expect(result.error).not.toBeNull();
  });

  it('should return an error if email has @ and not domain.com', () => {
    user.email = 'email@';
    const result = validateUserLogin(user);
    expect(result.error).not.toBeNull();
  });
});