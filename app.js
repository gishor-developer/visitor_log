const express = require('express')
const morgan = require('morgan')
const createError = require('http-errors')
require('dotenv').config()

const connectDB = require('./config/db');

const AuthRoute = require('./routes/authRoutes')

const app = express()
app.use(morgan('dev'))

const PORT = process.env.PORT || 5000

// app.use('/', async (req, res, next) => {
//     res.send('Hello the express..')
// })

app.use('/auth', AuthRoute)

app.use(async (req, res, next) => {
    next(createError.NotFound('This route does not exist!'))
})

app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send({
        //success: false,
        // status: err.status || 500,
        error: err.message
    })
})

app.listen(PORT, () => {
    console.log(`App Running on port ${PORT}`)
})
