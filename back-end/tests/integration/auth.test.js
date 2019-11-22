const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const { User } = require('../../models/user');

let server;

describe('/auth', () => {
  beforeEach(() => { server = require('../../../index')});
  afterEach(async () => {
    await server.close();
    await User.remove({});
  });

  
  const user = {
    name: 'test',
    email: 'test@hotmail.com',
    password: 'password'
  }

  async function register(user) {
    const result = await request(server).post('/auth/register').send(user);
    return result.status;
  }

  async function decodeToken(token) {
    return decoded = jwt.verify(token, config.get('jwtPrivateKey'));
  }

  describe('POST /register', () => {
    it ('should return a 200 status code if user input is valid ', async () => {
      const status = await register(user);
      expect(status).toBe(200);
    })
  });

  describe('POST /register', () => {
    it ('should return 400 status code if email already exists ', async () => {
      await register(user);
      const status = await register(user);
      expect(status).toBe(400);
    });
  });

  describe('POST /register', () => {
    it ('should return 400 status code if name is missing ', async () => {
      user.name = '';
      const status = await register(user);
      expect(status).toBe(400);
    });
  });

  describe('POST /register', () => {
    it ('should return 400 status code if password is missing ', async () => {
      user.password = '';
      const status = await register(user);
      expect(status).toBe(400);
    });
  });

  describe('POST /register', () => {
    it ('should return 400 status code if email is missing ', async () => {
      user.email = '';
      const status = await register(user);
      expect(status).toBe(400);
    });
  });

  describe('POST /login', () => {
    it('should return status code 200 if credentials are valid', async () => {
      const test = await register();
      const user = {
        email: 'test@hotmail.com',
        password: 'password'
      };
      const result = await request(server).post('/auth/login').send(user);
      expect(result.status).toBe(200);
    });
  });

  describe('POST /login', () => {
    it('should return status code 400 if email is missing', async () => {
      const test = await register();
      const user = {
        email: '',
        password: 'password'
      };
      const result = await request(server).post('/auth/login').send(user);
      expect(result.status).toBe(400);
    });
  });

  describe('POST /login', () => {
    it('should return status code 400 if password is missing', async () => {
      const test = await register();
      const user = {
        email: 'test@hotmail.com',
        password: ''
      };
      const result = await request(server).post('/auth/login').send(user);
      expect(result.status).toBe(400);
    });
  });

});