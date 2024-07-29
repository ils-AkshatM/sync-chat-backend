import { Router } from 'express'
import { getAllMessages } from '../controllers/MessageController.js'
import { verifyToken } from '../middlewares/AuthMiddleware.js'

const MessageRoutes = Router()


MessageRoutes.post('/get-all-messages', verifyToken, getAllMessages)


export default MessageRoutes