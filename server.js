const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to allow Vercel frontend
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://dev-blog-front-end.vercel.app',
    'https://dev-blog-front-end-elixir-ndoros-projects.vercel.app',
    'https://dev-blog-front-end-git-main-elixir-ndoros-projects.vercel.app',
    /\.vercel\.app$/  // Allow all Vercel preview deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

const isProd = process.env.NODE_ENV === 'production';
const mongoUri = process.env.MONGO_URI;

if (isProd && !mongoUri) {
  console.error('MONGO_URI is not set. Configure it in Render Environment.');
  process.exit(1);
}

mongoose.connect(mongoUri || 'mongodb://localhost:27017/dev-blog')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Developer Blogging API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
