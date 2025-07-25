
import mongoose, { Schema, Types, model } from 'mongoose';

const Chatschema = new Schema({
    mainUser: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    },
    subpartisipant: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    },
    messages: [{
        message: { type: String, required: true, },
        senderId: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
        }


    }]


}, { timestamps: true });

const ChatModell = mongoose.models.messages || model('messages', Chatschema);

export default ChatModell;
