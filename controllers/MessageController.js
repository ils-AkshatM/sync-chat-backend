
import Message from './../models/messageModel.js';




// ====================== GET MESSAGES ======================
export const getAllMessages = async (req, res) => {
    try {
        const senderId = req.userId
        const { recipientId } = req.body;

        if (!senderId || !recipientId) {
            return res.status().json({
                message: 'Both sender and recipient IDs required',
                success: false
            })
        }

        const AllMessages = await Message.find(
            {
                $or: [
                    { sender: senderId , recipient: recipientId},
                    { sender: recipientId , recipient: senderId},
                ]
            }
        ).sort( {timestamp:1})




        return res.status(200).json({
            AllMessages,
            success: true,
            message: 'All Messages fetched successfully'
        });

    } catch (error) {
        console.log(error);
        console.log("Error while all Messages fetching => ", error)
        res.status(500).json({
            message: 'Error while all Messages fetching',
            error: error.message
        })
    }
}
