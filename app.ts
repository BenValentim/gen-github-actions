import express from 'express';

async function startServer() {
  const app = express();

  app.use(express.json());

  app.use('/api');

  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Server runing port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Error starting the server:', err);
});