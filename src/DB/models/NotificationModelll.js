import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["friend_request", "exam","friend_accept", "message"], default: "friend_request" },
    title: { type: String, required: true },
    body: { type: String, required: true },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

export const NotificationModelll = mongoose.model("Notificationnn", notificationSchema);
