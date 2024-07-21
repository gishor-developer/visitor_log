const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
// const { Schema } = mongoose;
const Schema = mongoose.Schema;

const authSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    // Soft delete field
    isDeleted: {
        type: Boolean,
        defaults: false
    }
}, {
    timestamps: true
});

authSchema.pre('save', async function (next) {
    try {
        if (this.isNew) {
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(this.password, salt)
            this.password = hashedPassword
        }
        next()
    } catch (error) {
        next(error)
    }
});

authSchema.methods.isValidPassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password)
    } catch (error) {
        throw error
    }
};

authSchema.methods.softDelete = function (callback) {
    this.isDeleted = true;
    this.save(callback);
};

// Create a virtual property for the full name
authSchema.virtual('id').get(function () {
    return `${this._id}`;
});

// // Ensure virtual fields are included in toJSON and toObject
authSchema.set('toJSON', { virtuals: true });
authSchema.set('toObject', { virtuals: true });

const Auth = mongoose.model('Auth', authSchema);
module.exports = Auth;