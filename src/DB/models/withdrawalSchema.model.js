import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 1,
    },
    phone: {
        type: Number,
        required: true,
        min: 1,
    },
    serviceType: {
        type: String,
     
        required: true,
    },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("Withdrawall", withdrawalSchema);
