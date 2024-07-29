
import express from 'express'
import dontenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import connectDB from './config/database.js';
import authRoutes from './routes/AuthRoutes.js';
import ContactsRoutes from './routes/ContactsRotes.js';
import setupSocket from './socket.js';
import MessageRoutes from './routes/MessageRoutes.js';
import ChannelRoutes from './routes/ChannelRoutes.js';

dontenv.config()

const PORT = process.env.PORT || 5000;
const ORIGIN = process.env.ORIGIN
const app = express()

// middleware 
app.use(express.json()); // to parse json body
app.use(cookieParser());
app.use(
    cors({
        origin: [ORIGIN, 'http://localhost:5173'], // frontend link
        // origin: '*',
        methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
        credentials: true
    })
);

// console.log("ORIGIN from app = ", ORIGIN)


const server = app.listen(PORT, () => {
    console.log(`Server Started on PORT ${PORT}`);
});


// setup socket
setupSocket(server)


// connect Database
connectDB()


// mount routes
app.use('/api/auth', authRoutes)
app.use('/api/contacts', ContactsRoutes)
app.use('/api/message', MessageRoutes)
app.use('/api/channel', ChannelRoutes)


// Default Route
app.get('/', (req, res) => {
    // console.log('Your server is up and running..!');
    res.send(`<div>
    This is Default Route  
    <p>Everything is OK 😉👍 </p>
    </div>`);
})