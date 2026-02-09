const express = require('express');
const mongoose = require('mongoose');
const elementsRouter = require('./routes/elements');
const reactionsRouter = require('./routes/reactions');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api', elementsRouter);
app.use("/api", reactionsRouter);

app.get('/health', (req, res) => {
  res.json('Genesis Lab backend is alive 🚀');
});

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => { console.log(`Failed to connect to MngoDB: ${err}`) });