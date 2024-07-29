import jwt from "jsonwebtoken";


export const verifyToken = async (req, res, next) => {
    // extract token by anyone from this 3 ways
    const token = req.body?.token
        || req.cookies?.token
        || req.header('Authorization')?.replace('Bearer ', '');


    // if token is undefined
    if (!token) {
        console.log('Token is Missing')
        return res.status(401).json({
            status: false,
            message: 'Token is Missing'
        })
    }

    // console.log('Token ==> ', token);
    // console.log('From body -> ', req.body?.token);
    // console.log('from cookies -> ', req.cookies?.token);
    // console.log('from headers -> ', req.header('Authorization')?.replace('Bearer ', ''));


    jwt.verify(token, process.env.JWT_KEY, (error, payload) => {
        // console.log('verified decode token => ', payload);
        // decode example
        //    {
        //   email: 'anigade2@gmail.com',
        //   userId: '66940b8c270abf314dccaaf8',  
        //   iat: 1721040442,
        //   exp: 1980240442
        // }

        // invalid token
        if (error) {
            return res.status(403).json({
                status: false,
                message: 'Token is invalid'
            })
        }

        // store userId in req body
        req.userId = payload.userId
        next() // go to next middleware
    })
}