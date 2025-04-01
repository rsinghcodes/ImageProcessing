const express = require('express');
const path = require('path');
const routes = require('./routes');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  '/images/',
  express.static(path.resolve(__dirname, 'public', 'images'))
);
app.use(routes);

module.exports = app;
