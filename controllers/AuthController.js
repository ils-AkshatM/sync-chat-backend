import jwt from 'jsonwebtoken';
import User from '../models/userModel.js'
import { compare } from 'bcrypt';


const tokenExpireTime = 3 * 24 * 60 * 60 * 1000

// create token by JWT
const createToken = (email, userId) => {
    return jwt.sign({ email, userId }, process.env.JWT_KEY, {
        expiresIn: tokenExpireTime
    })
}

// ====================== SIGN-UP ======================
export const signup = async (req, res, next) => {
    try {

        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required..!'
            });
        }

        // check user have registered already
        const checkUserAlreadyExits = await User.findOne({ email });

        // if yes ,then say to login
        if (checkUserAlreadyExits) {
            return res.status(400).json({
                success: false,
                message: 'User registered already, go to Login Page'
            });
        }

        // create user
        const user = await User.create({ email, password })

        // create token
        const token = createToken(email, user._id)

        // set cookies
        res.cookie("token", token, {
            tokenExpireTime,
            secure: true,
            sameSite: 'None'
        })

        // return success message
        return res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                profileSetup: user.profileSetup
            },
            token,
            success: true,
            message: 'User Registered Successfully'
        });

    } catch (error) {
        console.log("Error while creating user data => ", error)
        res.status(401).json({
            message: 'Error while creating user data',
            error: error.message
        })
    }
}



// ====================== LOGIN ======================
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required..!'
            });
        }

        // find user
        const user = await User.findOne({ email });

        // if not found ,then say to register
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User is not registered'
            });
        }

        // check password
        const checkPassword = await compare(password, user.password)
        if (!checkPassword) {
            return res.status(400).json({
                success: false,
                message: 'Password is incorrect'
            });
        }

        // create token
        const token = createToken(email, user._id)

        // set cookies
        res.cookie("token", token, {
            tokenExpireTime,
            secure: true,
            sameSite: 'None'
        })

        // erase password from user object , not from database
        user.password = undefined

        // return success message
        return res.status(200).json({
            user,
            token,
            success: true,
            message: 'User logged Successfully'
        });

    } catch (error) {
        console.log("Error while loging user => ", error)
        res.status(401).json({
            message: 'Error while loging user',
            error: error.message
        })
    }
}



// ====================== GET USER INFO ======================
export const getUserInfo = async (req, res, next) => {
    try {
        const userId = req.userId;
        console.log("userId = ", userId)
        if (!userId) {
            console.log('userId not found')
            return res.status(400).json({
                success: false,
                message: 'userId not found'
            });
        }

        // find user
        const user = await User.findById(userId);
        console.log("user-info = ", user)

        // if not found
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // erase password from user object , not from database
        user.password = undefined

        // return success message
        return res.status(200).json({
            user,
            success: true,
            message: 'User-info found Successfully'
        });

    } catch (error) {
        console.log("Error while getting user-info => ", error)
        res.status(500).json({
            message: 'Error while getting user-info',
            error: error.message
        })
    }
}




// ====================== UPDATE PROFILE ======================
export const updateProfile = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { firstName, lastName, image, color } = req.body
        // console.log("Have to update this values ==> ")
        // console.log({ firstName, lastName, image, color, userId })


        if (!userId) {
            console.log('userId not found')
            return res.status(400).json({
                success: false,
                message: 'userId not found'
            });
        }

        if (!firstName || !lastName) {
            console.log('First name , last name , color is required')
            return res.status(400).json({
                success: false,
                message: 'First name , last name , color is required'
            });
        }

        // find user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                firstName, lastName, image, color, profileSetup: true
            },
            { new: true, runvalidators: true }
        );
        // console.log("updated User-info = ", updatedUser)

        // if not found
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // erase password from user object , not from database
        updatedUser.password = undefined

        // return success message
        return res.status(200).json({
            user: updatedUser,
            success: true,
            message: 'User-info updated Successfully'
        });

    } catch (error) {
        console.log("Error while updating user-info => ", error)
        res.status(500).json({
            message: 'Error while updating user-info',
            error: error.message
        })
    }
}




// ====================== LOGOUT ======================
export const logout = async (req, res, next) => {
    try {

        // clear cookies
        res.cookie("token", "", { maxAge: 1, secure: true, sameSite: 'None' })

        // return success message
        return res.status(200).json({
            success: true,
            message: 'User logout Successfully'
        });

    } catch (error) {
        console.log("Error while logging out user => ", error)
        res.status(500).json({
            message: 'Error while logging out user',
            error: error.message
        })
    }
}