import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
    channelName: {
        type: String,
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        required: false
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
});

// update 'updatedAt' value
channelSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

channelSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});

const Channel = mongoose.models?.Channel || mongoose.model('Channel', channelSchema);

export default Channel;
