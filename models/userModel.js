import mongoose from "mongoose";
import { genSalt, hash } from "bcrypt";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        require: [true, 'Email is required'],
        unique: true
    },
    password: {
        type: String,
        require: [true, 'Password is required'],
    },
    firstName: {
        type: String,
        require: false,
    },
    lastName: {
        type: String,
        require: false,
    },
    image: {
        type: String,
        require: false,
    },
    color: {
        type: Number,
        require: false,
    },
    profileSetup: {
        type: Boolean,
        default: false,
    },
})

// pasword will get hashed before saving user data in database
userSchema.pre('save', async function (next) {
    const salt = await genSalt()
    this.password = await hash(this.password, salt)
    next()
})


const User = mongoose.models?.User || mongoose.model('User', userSchema)

export default User