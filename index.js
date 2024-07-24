const express = require('express');
const morgan = require('morgan');
const createError = require('http-errors');

require('dotenv').config();

const bodyparser = require('body-parser');
const connectMongoDB = require('./config/db');
const connectRedis = require('./config/redisClient');

const fs = require('fs');
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const { logger } = require('./middlewares/logEvents');
const { errorHandler } = require('./middlewares/errorHandler');

const {
    verifyAccessToken
} = require('./helpers/jwtHelpers');

// Import versioned routes
const authRoutes = require('./routes/authRoutes');
const v1Routes = require('./routes/v1Routes');
const v2Routes = require('./routes/v2Routes');

const port = process.env.PORT || 5000;

const app = express()

app.use(logger)
app.use(bodyparser.urlencoded({ extended: true }))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(express.static(path.join(__dirname, './public')))

// Connect to MongoDB
connectMongoDB();

// Connect to RedisClient
let redisClient;
const initializeRedis = async () => {
    redisClient = await connectRedis();
};
initializeRedis();


app.get('/set', async (req, res) => {
    if (redisClient) {
        await redisClient.set('key', 'value');
        res.send('Value set in Redis');
    } else {
        res.status(500).send('Redis client not initialized');
    }
});

// Use versioned routes
app.use('/auth', authRoutes);
app.use('/api/v1', verifyAccessToken, v1Routes);
app.use('/api/v2', verifyAccessToken, v2Routes);

app.use(async (req, res, next) => {
    next(createError.NotFound('This route does not exist!'))
})

app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.json({
        success: false,
        error: err.message
    })
})

app.use(errorHandler);

app.listen(port, () => {
    console.log(`App Running on port ${port}`)
})

// app.all('*', (req, res) => {
//     res.status(404);
//     res.json({ "error": "404 Not Found" })
// })
