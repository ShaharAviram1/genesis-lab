const express = require('express');
const mongoose = require('mongoose');
const substanceRouter = require('./routes/substances');
const reactionsRouter = require('./routes/reactions');
const userRouter = require('./routes/users');
const atomsRouter = require('./routes/atoms');
const { reactorRuntime } = require('./realtime/reactorRuntime');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
reactorRuntime(server); // Start the reactor runtime for WebSocket handling

app.use(cors());
app.use(express.json());
app.use('/api', substanceRouter);
app.use('/api', reactionsRouter);
app.use('/api', userRouter);
app.use('/api', atomsRouter);

app.get('/health', (req, res) => {
  res.json('Genesis Lab backend is alive 🚀');
});

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Connected to MongoDB");
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => { console.log(`Failed to connect to MngoDB: ${err}`) });