import dontenv from 'dotenv'
import { Server as SocketIoServer } from "socket.io";
import Message from "./models/messageModel.js";
import Channel from './models/channelModel.js';
dontenv.config()

const ORIGIN = process.env.ORIGIN

const setupSocket = (server) => {

    const io = new SocketIoServer(server, {
        cors: {
            origin: [ORIGIN, 'http://localhost:5173'], // frontend link
            // origin: '*',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });
    // console.log("ORIGIN from socket = ", ORIGIN)

    // map
    const userSocketMap = new Map();


    // disconnect
    const disconnect = (socket) => {
        // console.log(`Client Disconnected: ${socket.id}`);
        for (const [userId, socketId] of userSocketMap.entries()) {
            if (socketId == socket.id) {
                userSocketMap.delete(userId);
                break;
            }
        }
    };


    // send Personal Message
    const sendMessage = async (message) => {
        console.log("Actual message = ", message)
        // example of message
        // Actual message = {
        //     sender: '669a8069e06cf14ab5281b0b',
        //     recipient: '669a80cfe06cf14ab5281b12',
        //     content: 'ho gg',
        //     messageType: 'text'
        // }


        const senderSocketId = userSocketMap.get(message.sender)
        const recipientSocketId = userSocketMap.get(message.recipient)

        const createMessage = await Message.create(message)
        const messageData = await Message.findById(createMessage._id)
            .populate("sender", "id email firstName lastName image color")
            .populate("recipient", "id email firstName lastName image color")

        if (senderSocketId) {
            // console.log(`Message: ${message} is sending to userId : ${message.recipient} `)
            io.to(senderSocketId).emit('receivedMessage', messageData)
        }
        if (recipientSocketId) {
            // console.log("message has received")
            io.to(recipientSocketId).emit('receivedMessage', messageData)
        }
    }



    // send Channel Message
    const sendChannelMessage = async (message) => {
        const { sender, channelId, content, messageType, fileUrl } = message

        const createMessage = await Message.create({
            sender,
            recipient: null,
            channelId,
            content,
            messageType,
            fileUrl,
            timestamp: Date.now()
        })

        const messageData = await Message.findById(createMessage._id)
            .populate("sender", "email firstName lastName image color")
            .exec()

        const channel = await Channel.findByIdAndUpdate(channelId, {
            $push: { messages: createMessage._id }
        })


        if (channel && channel._id) {
            const finalMessageData = { ...messageData._doc, channelId: channel._id }

            channel.members.forEach((member) => {
                const memberSocketId = userSocketMap.get(member._id.toString())
                if (memberSocketId) {
                    io.to(memberSocketId).emit("receive-channel-message", finalMessageData)
                }
            })
            // send msg to admin, as he is not in member list
            const adminSocketId = userSocketMap.get(channel.admin._id.toString())
            if (adminSocketId) {
                io.to(adminSocketId).emit("receive-channel-message", finalMessageData)
            }
        }
    }



    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;
        if (userId) {
            userSocketMap.set(userId, socket.id);
            console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
        } else {
            console.log("User ID not provided during connection.");
        }

        socket.on("disconnect", () => disconnect(socket));
        socket.on("sendMessage", sendMessage)
        socket.on("send-channel-message", sendChannelMessage)
    });
};

export default setupSocket;
