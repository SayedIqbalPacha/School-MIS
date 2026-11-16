const mongoose = require('mongoose');
const dotenv = require('dotenv');

// unchaught exception are those erros that can occure in our app and we did not handle them.
// like calling a variable that does not exist.
process.on('uncaughtException', (err) => {
  console.log('Uncauht Exception! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

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

const port = process.env.PORT || 9000;
let server;

mongoose
  .connect(DB)
  .then(() => {
    console.log('DB connection successful');
    server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  });

// handling global unhandled promises in all over the application
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! SHUTTING DOWN...');
  if (!server) return process.exit(1);
  server.close(() => {
    process.exit(1);
  });
});
