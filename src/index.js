require('dotenv').config();
const express = require('express');
const voiceRoutes = require('./routes/voice');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', voiceRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});