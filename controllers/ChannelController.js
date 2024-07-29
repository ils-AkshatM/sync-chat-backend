import mongoose from "mongoose";
import User from "../models/userModel.js";
import Channel from './../models/channelModel.js';





// ====================== CREATE CHANNEL ======================
export const createChannel = async (req, res) => {
    try {
        const { members, channelName } = req.body;
        const { userId } = req;

        // validate data
        if (!members || !channelName) {
            return res.status(404).json({
                success: false,
                message: 'Members and channel name required'
            });
        }

        // find admin
        const admin = await User.findById(userId);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found..!'
            });
        }

        // check all members are valid or not
        const validMembers = await User.find({
            _id: { $in: members }
        }, "_id");
        // console.log("validMembers = ", validMembers);


        // if some members not found
        if (validMembers.length !== members.length) {
            return res.status(400).json({
                success: false,
                message: 'Some members are not found'
            });
        }


        // create new channel
        const newChannel = await Channel.create({
            members,
            channelName,
            admin: userId
        });

        // to call pre method to update 'updateAt' value
        await newChannel.save();

        // return success response
        return res.status(200).json({
            channel: newChannel,
            success: true,
            message: 'New channel created successfully'
        });

    } catch (error) {
        console.log("Error while creating new channel => ", error);
        res.status(500).json({
            message: 'Error while creating new channel',
            error: error.message
        });
    }
};





// ====================== GET ALL CHANNELS ======================
export const getUserChannels = async (req, res) => {
    try {
        const { userId } = req;

        const channels = await Channel.find({
            $or: [{ admin: userId }, { members: userId }]
        })
            .populate("admin", "firstName lastName email image")
            .populate("members", "firstName lastName email image")
            .sort({ updatedAt: -1 })


        // console.log("all user Channels = ", channels)


        // return success response
        return res.status(200).json({
            channels,
            success: true,
            message: 'User channels fetched successfully'
        });

    } catch (error) {
        console.log("Error while fetching user channels => ", error);
        res.status(500).json({
            message: 'Error while fetching user channels',
            error: error.message
        });
    }
};




// ====================== GET MESSAGES CHANNELS ======================
export const getChannelsMessages = async (req, res) => {
    try {
        const { userId } = req;
        const { channelId } = req.body;

        if (!channelId) {
            return res.status(404).json({
                success: false,
                message: 'Channel ID required'
            });
        }

        // Find the channel and populate members
        const channel = await Channel.findById(channelId).populate('members');

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        // Check if the user is a member or admin of the channel
        const isMember = channel.members.some(member => member._id.toString() === userId);
        const isAdmin = channel.admin._id.toString() === userId;

        if (!isMember && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view this channel'
            });
        }

        // Populate the messages with sender details if the user is a member
        await channel.populate({
            path: 'messages',
            populate: {
                path: 'sender',
                select: 'email firstName lastName image color'
            }
        })


        // Return success response
        return res.status(200).json({
            channelMessages: channel.messages,
            success: true,
            message: 'Channel messages fetched successfully'
        });

    } catch (error) {
        console.log("Error while fetching channel messages => ", error);
        res.status(500).json({
            message: 'Error while fetching channel messages',
            error: error.message
        });
    }
};
