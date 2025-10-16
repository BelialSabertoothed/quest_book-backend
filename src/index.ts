import cors from 'cors';
import express from 'express';
import profileRoutes from './routes/profile';
import taskRoutes from './routes/tasks';

const app = express();
app.use(cors({
  origin: '*',
}));
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Hello World');
});
app.use('/api', profileRoutes);
app.use('/api', taskRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running!!`);
});