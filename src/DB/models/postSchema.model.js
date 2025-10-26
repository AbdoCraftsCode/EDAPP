import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // صاحب البوست

    title: { type: String },       // ممكن يكون عنوان فقط (اختياري)
    content: { type: String },     // نص المنشور (اختياري)

    image: {
        secure_url: { type: String },
        public_id: { type: String }
    }, // صورة البوست (اختياري)

    reactions: {
        like: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        love: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        laugh: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        support: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    }, // أنواع الريأكشنات

    commentsCount: { type: Number, default: 0 },

}, { timestamps: true });

export const PostModel = mongoose.model("Post", postSchema);
