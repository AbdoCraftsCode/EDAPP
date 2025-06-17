
import mongoose, { Schema, Types, model } from 'mongoose';

const ChatSchema = new Schema({
    participants: [{
        type: Types.ObjectId,
        ref: 'User',
        required: true
    }],
    messages: [{
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // ✅ إضافة ID للرسالة
        message: { type: String, required: true },
        senderId: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
        }
    }]
}, { timestamps: true });
  
  
export const ChatModel = mongoose.models.Chat || model('Chat', ChatSchema);


