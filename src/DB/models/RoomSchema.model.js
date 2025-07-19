// models/Room.model.js
import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    roomName: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
    users: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            joinedAt: { type: Date, default: Date.now }
        }
    ],
    bannedUsers: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            bannedUntil: { type: Date }
        }
    ],
    isStarted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Room', RoomSchema);
