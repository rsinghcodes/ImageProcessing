import express from 'express';
import path from 'path';
import routes from './routes';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  '/images/',
  express.static(path.resolve(__dirname, 'public', 'images'))
);
app.use(routes);

export default app;
