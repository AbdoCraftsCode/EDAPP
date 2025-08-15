import mongoose, { Schema, Types, model } from 'mongoose';





const ChatSchema = new Schema({
    participants: [{
        type: Types.ObjectId,
        ref: 'User',
        // required: true
    }],
    mainUser: {
        type: Types.ObjectId,
        ref: 'User',
        // required: true
    },
    subpartisipant: {
        type: Types.ObjectId,
        ref: 'User',
        // required: true
    },

    messages: [{
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        message: { type: String, default: null },
        voiceUrl: { type: String, default: null },
        imageUrl: { type: String, default: null },
        fileUrl: { type: String, default: null },
        // fileName: { type: String },          // 🆕 اسم الملف
        // fileSize: { type: Number },          // 🆕 الحجم بالميجابايت
        // type: { type: String },
        senderId: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
        },

    }]
}, { timestamps: true });

export const ChatModel = mongoose.models.Chat || model('Chat', ChatSchema);
  
// const ChatSchema = new Schema({
//     participants: [{
//         type: Types.ObjectId,
//         ref: 'User',
//         required: true
//     }],
//     messages: [{
//         _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // مهم عشان تدي كل رسالة ID
//         message: { type: String, required: true },
//         senderId: {
//             type: Types.ObjectId,
//             ref: 'User',
//             required: true
//         }
//     }]
// }, { timestamps: true });

// export const ChatModel = mongoose.models.Chat || model('Chat', ChatSchema);


