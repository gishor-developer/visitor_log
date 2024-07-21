
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add a email'],
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    role: {
        type: String,
        enum: ['admin', 'user'], // 1 - EmiratesId, 2 - Passport
        required: [true, 'Please add a role']
    },
    // Soft delete field
    isDeleted: {
        type: Boolean,
        defaults: false
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
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

userSchema.methods.isValidPassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password)
    } catch (error) {
        throw error
    }
};

userSchema.methods.softDelete = function (callback) {
    this.isDeleted = true;
    this.save(callback);
};

// Create a virtual property for the full name
userSchema.virtual('id').get(function () {
    return `${this._id}`;
});

// Ensure virtual fields are included in toJSON and toObject
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema)

module.exports = User