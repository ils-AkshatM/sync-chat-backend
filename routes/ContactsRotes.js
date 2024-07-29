import { Router } from 'express'
import { searchContacts, getContactsForDMList, getAllContacts } from '../controllers/ContactsController.js'
import { verifyToken } from '../middlewares/AuthMiddleware.js'

const ContactsRoutes = Router()

ContactsRoutes.post('/search-contacts', verifyToken, searchContacts)
ContactsRoutes.post('/get-contacts-for-dm', verifyToken, getContactsForDMList)
ContactsRoutes.get('/get-all-contacts', verifyToken, getAllContacts)

export default ContactsRoutes