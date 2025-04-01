const app = require('./app');
const connect = require('./db');

const PORT = 3000;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connect(
    process.env.DB_URL || 'mongodb://localhost:27017/image_processing'
  );
});
