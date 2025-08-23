// models/room.model.js
import mongoose from "mongoose";

const roomSchemaa = new mongoose.Schema({
    name: { type: String, required: true },
    // 0=Sunday .. 6=Saturday | هنخلي الافتراضي 6 (السبت)
    resetDay: { type: Number, default: 6, min: 0, max: 6 },
}, { timestamps: true });

export const RoomModell = mongoose.model("Roommmm", roomSchemaa);
