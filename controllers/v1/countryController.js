const {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} = require('../../helpers/jwtHelpers');

const data = {
    country: require('../../public/data/country-by-abbreviation.json'),
    flag: require('../../public/data/country-by-flag.json'),
    phoneCode: require('../../public/data/country-by-calling-code.json')
}

const list = async (req, res) => {

    try {
        const countryData = data.country;

        const responseCode = 200
        const responseDate = {
            "success": true,
            "data": countryData
        }
        res.status(responseCode).json(responseDate)
    } catch (err) {
        console.error(err);
    }
}

const flag = async (req, res) => {

    try {
        const countryFlagData = data.flag;

        const responseCode = 200
        const responseDate = {
            "success": true,
            "code": responseCode,
            "message": "",
            "data": countryFlagData
        }
        res.status(responseCode).json(responseDate)
    } catch (err) {
        console.error(err);
    }
}

const code = async (req, res) => {

    try {
        const phoneCodeData = data.phoneCode;

        const responseCode = 200
        const responseDate = {
            "success": true,
            "code": responseCode,
            "message": "",
            "data": phoneCodeData
        }
        res.status(responseCode).json(responseDate)
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    list, flag, code
}