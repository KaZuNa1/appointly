import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';


const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api', routes);

export default app;
