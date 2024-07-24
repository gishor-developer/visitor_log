const JWT = require('jsonwebtoken')
const createError = require('http-errors')
const connectRedis = require('../config/redisClient')

// Connect to RedisClient
let redisClient;
const initializeRedis = async () => {
    redisClient = await connectRedis();
};
initializeRedis();

const signAccessToken = async (userId, next) => {
    try {
        return new Promise((resolve, reject) => {
            const payload = {}
            const secret = process.env.ACCESS_TOKEN_SECRET
            const options = {
                expiresIn: '1h',
                issuer: 'mywebsite.com',
                audience: userId,
            }
            JWT.sign(payload, secret, options, (err, token) => {
                if (err) {
                    console.log(err.message)
                    reject(createError.InternalServerError())
                    return
                }
                resolve(token)
            })
        })
    } catch (error) {
        console.log(error);
        if (error.isJoi === true)
            return next(createError.BadRequest('Invalid Username/Password'))
        next(error)
    }
};

const verifyAccessToken = async (req, res, next) => {
    try {
        if (!req.headers['authorization']) return next(createError.Unauthorized())
        const authHeader = req.headers['authorization']
        const bearerToken = authHeader.split(' ')
        const token = bearerToken[1]
        JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if (err) {
                const message =
                    err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
                return next(createError.Unauthorized(message))
            }
            req.payload = payload
            next()
        })
    } catch (error) {
        console.log(error);
        if (error.isJoi === true)
            return next(createError.BadRequest('Invalid Username/Password'))
        next(error)
    }
};

const signRefreshToken = async (userId, next) => {
    try {
        return await new Promise((resolve, reject) => {
            const payload = {}
            const secret = process.env.REFRESH_TOKEN_SECRET
            const options = {
                expiresIn: '1y',
                issuer: 'mywebsite.com',
                audience: userId,
            }
            JWT.sign(payload, secret, options, (err, token) => {
                if (err) {
                    console.log(err.message)
                    // reject(err)
                    reject(createError.InternalServerError())
                }

                const key = userId;
                const value = token;
                const expirationInSeconds = 36; // 1 hour

                const result = redisClient.set(key, value, {
                    EX: expirationInSeconds
                });
                resolve(token)
            })
        })
    } catch (error) {
        console.log(error);
        if (error.isJoi === true)
            return next(createError.BadRequest('Invalid Username/Password'))
        next(error)
    }
};

const verifyRefreshToken = async (refreshToken, next) => {
    try {
        const userId = JWT.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, payload) => {
                if (err) return reject(createError.Unauthorized())
                return payload.aud
            }
        )
        const key = userId;
        const exists = await redisClient.exists(key);
        if (exists) {
            const value = await redisClient.get(key);
            if (refreshToken === value) {
                return userId;
            } else {
                return 0
            }
        } else {
            return 0
        }

    } catch (error) {
        console.log(error);
        // if (error.isJoi === true)
            return 0
    }
};

module.exports = {
    signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken
    // signAccessToken: (userId) => {
    //     return new Promise((resolve, reject) => {
    //         const payload = {}
    //         const secret = process.env.ACCESS_TOKEN_SECRET
    //         const options = {
    //             expiresIn: '1h',
    //             issuer: 'mywebsite.com',
    //             audience: userId,
    //         }
    //         JWT.sign(payload, secret, options, (err, token) => {
    //             if (err) {
    //                 console.log(err.message)
    //                 reject(createError.InternalServerError())
    //                 return
    //             }
    //             resolve(token)
    //         })
    //     })
    // },
    // verifyAccessToken: (req, res, next) => {
    //     if (!req.headers['authorization']) return next(createError.Unauthorized())
    //     const authHeader = req.headers['authorization']
    //     const bearerToken = authHeader.split(' ')
    //     const token = bearerToken[1]
    //     JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
    //         if (err) {
    //             const message =
    //                 err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
    //             return next(createError.Unauthorized(message))
    //         }
    //         req.payload = payload
    //         next()
    //     })
    // },
    // signRefreshToken: (userId) => {
    //     return new Promise((resolve, reject) => {
    //         const payload = {}
    //         const secret = process.env.REFRESH_TOKEN_SECRET
    //         const options = {
    //             expiresIn: '1y',
    //             issuer: 'mywebsite.com',
    //             audience: userId,
    //         }
    //         JWT.sign(payload, secret, options, (err, token) => {
    //             if (err) {
    //                 console.log(err.message)
    //                 // reject(err)
    //                 reject(createError.InternalServerError())
    //             }
    //             resolve(token)

    //             redisClient.SET(userId, token, 'EX', 365 * 24 * 60 * 60, (err, reply) => {
    //                 if (err) {
    //                     console.log(err.message)
    //                     reject(createError.InternalServerError())
    //                     return
    //                 }
    //                 resolve(token)
    //             })
    //         })
    //     })
    // },
    // verifyRefreshToken: (refreshToken) => {
    //     return new Promise((resolve, reject) => {
    //         JWT.verify(
    //             refreshToken,
    //             process.env.REFRESH_TOKEN_SECRET,
    //             (err, payload) => {
    //                 if (err) return reject(createError.Unauthorized())
    //                 const userId = payload.aud
    //                 // resolve(userId)
    //                 client.GET(userId, (err, result) => {
    //                     if (err) {
    //                         console.log(err.message)
    //                         reject(createError.InternalServerError())
    //                         return
    //                     }
    //                     if (refreshToken === result) return resolve(userId)
    //                     reject(createError.Unauthorized())
    //                 })
    //             }
    //         )
    //     })
    // },
}