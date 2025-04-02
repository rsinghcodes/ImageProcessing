require('dotenv').config();
const app = require('./app');
const connect = require('./db');

const PORT = 3000;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connect(process.env.DB_URL);
});
