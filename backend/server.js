const mongoose = require('mongoose');

const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config/config.env' });

if (!process.env.DATABASE) {
  throw new Error('DATABASE is missing from config/config.env');
}

if (
  process.env.DATABASE.includes('<PASSWORD>') &&
  !process.env.DATABASE_PASSWORD
) {
  throw new Error('DATABASE_PASSWORD is missing from config/config.env');
}

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  encodeURIComponent(process.env.DATABASE_PASSWORD),
);

mongoose
  // this is for local database connection
  //.connect(process.env.DATABASE_LOCAL)
  .connect(DB)
  .then(() => {
    console.log('DB connection successful');
  })
  .catch((err) => {
    console.error('DB connection failed:', err.message);
  });

const port = process.env.PORT || 9000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
