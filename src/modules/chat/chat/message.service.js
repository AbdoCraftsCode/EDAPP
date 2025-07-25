import { ChatModel } from "../../../DB/models/chaatmodel.js";
// import { scketConnections } from "../../../DB/models/User.model.js";
import { authenticationSocket } from "../../../middlewere/auth.socket.middlewere.js";
import * as dbservice from "../../../DB/dbservice.js"
import Usermodel, { scketConnections } from "../../../DB/models/User.model.js";
import mongoose from 'mongoose';
import { GeneralQuestionModel } from "../../../DB/models/questionSchema.model.js";
import { v4 as uuidv4 } from "uuid";
import RoomSchemaModel from "../../../DB/models/RoomSchema.model.js";
import examresultModel from "../../../DB/models/examresult.model.js";
import ExamModel from "../../../DB/models/exams.model.js";
import { getIo } from "../chat.socket.controller.js";



export const sendMessage2 = (socket) => {
    return socket.on("sendMessage2", async (messageData) => {
        try {
            const { data } = await authenticationSocket({ socket });

            if (!data.valid) {
                return socket.emit("socketErrorResponse", data);
            }

            const userId = data.user._id.toString();
            const { destId, message } = messageData;

            // التحقق من صحة الـ ObjectId
            if (!mongoose.Types.ObjectId.isValid(destId)) {
                return socket.emit("socketErrorResponse", {
                    message: "معرف المستخدم الهدف غير صالح"
                });
            }

            const chat = await dbservice.findOneAndUpdate({
                model: ChatModel,
                filter: {
                    $or: [
                        {
                            mainUser: new mongoose.Types.ObjectId(userId),
                            subpartisipant: new mongoose.Types.ObjectId(destId)
                        },
                        {
                            mainUser: new mongoose.Types.ObjectId(destId),
                            subpartisipant: new mongoose.Types.ObjectId(userId)
                        }
                    ]
                },
                data: {
                    $push: {
                        messages: {
                            text: message,
                            senderId: new mongoose.Types.ObjectId(userId)
                        }
                    }
                },
                options: { new: true, upsert: true }
            });

            // إرسال الرسالة للطرف الآخر
            const receiverSocket = scketConnections.get(destId);
            if (receiverSocket) {
                socket.to(receiverSocket).emit("receiveMessage2", {
                    message: message,
                    senderId: userId
                });
            }

            socket.emit("successMessage2", { message });

        } catch (error) {
            console.error('Error in sendMessage:', error);
            socket.emit("socketErrorResponse", {
                message: "حدث خطأ أثناء إرسال الرسالة"
            });
        }
    });
};




// export const sendMessage = (socket) => {
//     socket.on("sendMessage", async (messageData) => {
//         try {
//             const { data } = await authenticationSocket({ socket });

//             if (!data.valid) {
//                 return socket.emit("socketErrorResponse", data);
//             }

//             const user = data.user;
//             const userId = user._id.toString();
//             const {
//                 message,
//                 voiceUrl,
//                 imageUrl,
//                 fileUrl,
//                 fileName,
//                 fileSize,
//                 type
//             } = messageData;

//             const nothingSent = [message, voiceUrl, imageUrl, fileUrl]
//                 .every(val => !val || (typeof val === "string" && val.trim() === ""));

//             if (nothingSent) {
//                 return socket.emit("socketErrorResponse", {
//                     message: "❌ لا يمكن إرسال رسالة فارغة.",
//                     status: 400
//                 });
//             }

//             let chat = await ChatModel.findOne();
//             if (!chat) {
//                 chat = await ChatModel.create({
//                     participants: [user._id],
//                     messages: []
//                 });
//             }

//             if (!chat.participants.includes(user._id)) {
//                 chat.participants.push(user._id);
//             }

//             const messageId = new mongoose.Types.ObjectId();
//             const messageDoc = {
//                 _id: messageId,
//                 message: message || null,
//                 voiceUrl: voiceUrl || null,
//                 imageUrl: imageUrl || null,
//                 fileUrl: fileUrl || null,
//                 fileName: fileName || null,       // ✅ اسم الملف
//                 fileSize: fileSize || null,       // ✅ الحجم
//                 type: type || 'text',             // ✅ النوع
//                 senderId: user._id
//             };

//             chat.messages.push(messageDoc);
//             await chat.save();

//             const messageToSend = {
//                 _id: messageId,
//                 message: messageDoc.message,
//                 voiceUrl: messageDoc.voiceUrl,
//                 imageUrl: messageDoc.imageUrl,
//                 fileUrl: messageDoc.fileUrl,
//                 fileName: messageDoc.fileName,
//                 fileSize: messageDoc.fileSize,
//                 type: messageDoc.type,
//                 senderId: {
//                     _id: user._id,
//                     username: user.username
//                 }
//             };

//             for (const participantId of chat.participants) {
//                 const idStr = participantId.toString();
//                 if (idStr !== userId && scketConnections.has(idStr)) {
//                     socket.to(scketConnections.get(idStr)).emit("receiveMessage", messageToSend);
//                 }
//             }

//             socket.emit("successMessage", { message: messageToSend });

//         } catch (error) {
//             console.error("❌ خطأ أثناء إرسال الرسالة:", error);
//             socket.emit("socketErrorResponse", {
//                 message: "❌ فشل إرسال الرسالة",
//                 status: 500
//             });
//         }
//     });
// };











export const sendMessage = (socket) => {
    socket.on("sendMessage", async (messageData) => {
        try {
            const { data } = await authenticationSocket({ socket });

            if (!data.valid) {
                return socket.emit("socketErrorResponse", data);
            }

            const user = data.user;
            const userId = user._id.toString();
            const {
                message,
                voiceUrl,
                imageUrl,
                fileUrl
            } = messageData;

            
            const nothingSent = [message, voiceUrl, imageUrl, fileUrl]
                .every(val => !val || (typeof val === "string" && val.trim() === ""));

            if (nothingSent) {
                return socket.emit("socketErrorResponse", {
                    message: "❌ لا يمكن إرسال رسالة فارغة.",
                    status: 400
                });
            }

        
            let chat = await ChatModel.findOne();
            if (!chat) {
                chat = await ChatModel.create({
                    participants: [user._id],
                    messages: []
                });
            }

           
            if (!chat.participants.includes(user._id)) {
                chat.participants.push(user._id);
            }

            const messageId = new mongoose.Types.ObjectId();
            const messageDoc = {
                _id: messageId,
                message: message || null,
                voiceUrl: voiceUrl || null,
                imageUrl: imageUrl || null,
                fileUrl: fileUrl || null,
                senderId: user._id
            };

            chat.messages.push(messageDoc);
            await chat.save();

            const messageToSend = {
                _id: messageId,
                message: messageDoc.message,
                voiceUrl: messageDoc.voiceUrl,
                imageUrl: messageDoc.imageUrl,
                fileUrl: messageDoc.fileUrl,
                senderId: {
                    _id: user._id,
                    username: user.username
                }
            };

            for (const participantId of chat.participants) {
                const idStr = participantId.toString();
                if (idStr !== userId && scketConnections.has(idStr)) {
                    socket.to(scketConnections.get(idStr)).emit("receiveMessage", messageToSend);
                }
            }

            socket.emit("successMessage", { message: messageToSend });

        } catch (error) {
            console.error("❌ خطأ أثناء إرسال الرسالة:", error);
            socket.emit("socketErrorResponse", {
                message: "❌ فشل إرسال الرسالة",
                status: 500
            });
        }
    });
};
  

// const waitingUsers = [];

// export const handleMatching = (socket) => {
//     socket.on("startMatching", async ({ gender, lookingFor }) => {
//         const { data } = await authenticationSocket({ socket });

//         if (!data.valid) {
//             return socket.emit("socketErrorResponse", data);
//         }

//         const user = data.user;
//         const userId = user._id.toString();
//         const classId = user.classId?.toString();

//         console.log("📥 تم استقبال startMatching:", {
//             userId, gender, lookingFor, classId
//         });

//         if (!classId) {
//             return socket.emit("socketErrorResponse", {
//                 message: "❌ لا يوجد صف دراسي مرتبط بالمستخدم",
//                 status: 400
//             });
//         }

//         // طباعة القائمة قبل أي شيء
//         console.log("📃 قائمة الانتظار الحالية:", waitingUsers);

//         const alreadyWaiting = waitingUsers.some(
//             (u) => u.userId === userId && u.classId === classId
//         );
//         if (alreadyWaiting) {
//             console.log("⛔ المستخدم بالفعل في قائمة الانتظار");
//             return;
//         }

//         const matchIndex = waitingUsers.findIndex(
//             (u) =>
//                 u.classId === classId &&
//                 u.gender === lookingFor &&
//                 u.lookingFor === gender
//         );

//         if (matchIndex !== -1) {
//             const matchedUser = waitingUsers.splice(matchIndex, 1)[0];

//             const roomId = `room-${userId}-${matchedUser.userId}`;

//             console.log("✅ تمت المطابقة:", { user1: userId, user2: matchedUser.userId });

//             socket.emit("matched", { roomId, partnerId: matchedUser.userId });

//             if (scketConnections.has(matchedUser.userId)) {
//                 socket
//                     .to(scketConnections.get(matchedUser.userId))
//                     .emit("matched", { roomId, partnerId: userId });
//             }

//         } else {
//             const timeout = setTimeout(() => {
//                 const index = waitingUsers.findIndex((u) => u.userId === userId);
//                 if (index !== -1) {
//                     waitingUsers.splice(index, 1);
//                     socket.emit("timeout", {
//                         message: "⏳ انتهى وقت البحث، لم يتم العثور على شريك.",
//                     });
//                 }
//             }, 2 * 60 * 1000);

//             waitingUsers.push({
//                 userId,
//                 classId,
//                 gender,
//                 lookingFor,
//                 socketId: socket.id,
//                 timeout
//             });

//             console.log("➕ تم إضافة المستخدم لقائمة الانتظار");

//             socket.emit("waiting", {
//                 message: "⏳ جاري البحث عن شريك مطابق في نفس الصف الدراسي...",
//             });
//         }
//     });

//     socket.on("disconnect", () => {
//         const index = waitingUsers.findIndex((u) => u.socketId === socket.id);
//         if (index !== -1) {
//             clearTimeout(waitingUsers[index].timeout);
//             waitingUsers.splice(index, 1);
//         }
//     });
// };


// const waitingUsers = [];

// export const handleMatching = (socket) => {
//     socket.on("startMatching", async ({ gender, lookingFor }) => {
//         const { data } = await authenticationSocket({ socket });

//         if (!data.valid) {
//             return socket.emit("socketErrorResponse", data);
//         }

//         const user = data.user;
//         const userId = user._id.toString();
//         const classId = user.classId?.toString();

//         console.log("📥 تم استقبال startMatching:", {
//             userId, gender, lookingFor, classId
//         });

//         if (!classId) {
//             return socket.emit("socketErrorResponse", {
//                 message: "❌ لا يوجد صف دراسي مرتبط بالمستخدم",
//                 status: 400
//             });
//         }

//         console.log("📃 قائمة الانتظار الحالية:", waitingUsers);

//         const alreadyWaiting = waitingUsers.some(
//             (u) => u.userId === userId && u.classId === classId
//         );
//         if (alreadyWaiting) {
//             console.log("⛔ المستخدم بالفعل في قائمة الانتظار");
//             return;
//         }

//         const matchIndex = waitingUsers.findIndex(
//             (u) =>
//                 u.classId === classId &&
//                 u.gender === lookingFor &&
//                 u.lookingFor === gender
//         );

//         if (matchIndex !== -1) {
//             const matchedUser = waitingUsers.splice(matchIndex, 1)[0];
//             const roomId = `room-${userId}-${matchedUser.userId}`;

//             // ✅ جلب الأسئلة العشوائية بناءً على الصف الدراسي
//             const questions = await GeneralQuestionModel.aggregate([
//                 { $match: { classId: new mongoose.Types.ObjectId(classId) } },
//                 { $sample: { size: 10 } }
//             ]);

//             console.log("🧠 تم إرسال الأسئلة للطرفين:", questions);

//             socket.emit("matched", {
//                 roomId,
//                 partnerId: matchedUser.userId,
//                 questions
//             });

//             if (scketConnections.has(matchedUser.userId)) {
//                 socket
//                     .to(scketConnections.get(matchedUser.userId))
//                     .emit("matched", {
//                         roomId,
//                         partnerId: userId,
//                         questions
//                     });
//             }

//         } else {
//             const timeout = setTimeout(() => {
//                 const index = waitingUsers.findIndex((u) => u.userId === userId);
//                 if (index !== -1) {
//                     waitingUsers.splice(index, 1);
//                     socket.emit("timeout", {
//                         message: "⏳ انتهى وقت البحث، لم يتم العثور على شريك.",
//                     });
//                 }
//             }, 2 * 60 * 1000);

//             waitingUsers.push({
//                 userId,
//                 classId,
//                 gender,
//                 lookingFor,
//                 socketId: socket.id,
//                 timeout
//             });

//             console.log("➕ تم إضافة المستخدم لقائمة الانتظار");

//             socket.emit("waiting", {
//                 message: "⏳ جاري البحث عن شريك مطابق في نفس الصف الدراسي...",
//             });
//         }
//     });

//     socket.on("disconnect", () => {
//         const index = waitingUsers.findIndex((u) => u.socketId === socket.id);
//         if (index !== -1) {
//             clearTimeout(waitingUsers[index].timeout);
//             waitingUsers.splice(index, 1);
//         }
//     });
// };


const waitingUsers = [];
// const scketConnections = new Map(); // تأكد من استخدام هذا المتغير في مكان آخر لتخزين socket.id

export const handleMatching = (socket) => {
    // ⏺️ إضافة المستخدم إلى قائمة الاتصالات
    socket.on("registerConnection", ({ userId }) => {
        scketConnections.set(userId, socket.id);
    });

    // ✅ بدء المطابقة
    socket.on("startMatching", async ({ gender, lookingFor }) => {
        const { data } = await authenticationSocket({ socket });

        if (!data.valid) {
            return socket.emit("socketErrorResponse", data);
        }

        const user = data.user;
        const userId = user._id.toString();
        const classId = user.classId?.toString();

        console.log("📥 تم استقبال startMatching:", {
            userId, gender, lookingFor, classId
        });

        if (!classId) {
            return socket.emit("socketErrorResponse", {
                message: "❌ لا يوجد صف دراسي مرتبط بالمستخدم",
                status: 400
            });
        }

        const alreadyWaiting = waitingUsers.some(
            (u) => u.userId === userId && u.classId === classId
        );
        if (alreadyWaiting) {
            console.log("⛔ المستخدم بالفعل في قائمة الانتظار");
            return;
        }

        const matchIndex = waitingUsers.findIndex(
            (u) =>
                u.classId === classId &&
                u.gender === lookingFor &&
                u.lookingFor === gender
        );

        if (matchIndex !== -1) {
            const matchedUser = waitingUsers.splice(matchIndex, 1)[0];
            const roomId = `room-${userId}-${matchedUser.userId}`;

            // ✅ جلب أسئلة عشوائية بناءً على الصف الدراسي
            const questions = await GeneralQuestionModel.aggregate([
                { $match: { classId: new mongoose.Types.ObjectId(classId) } },
                { $sample: { size: 10 } }
            ]);

            console.log("🧠 تم إرسال الأسئلة للطرفين:", questions);

            // ✅ دالة لجلب إحصائيات المستخدم
            const getUserStats = async (id) => {
                const result = await examresultModel.aggregate([
                    { $match: { studentId: new mongoose.Types.ObjectId(id) } },
                    {
                        $group: {
                            _id: "$studentId",
                            totalScore: { $sum: "$totalScore" },
                            maxScore: { $sum: "$maxScore" },
                            examsCount: { $sum: 1 }
                        }
                    },
                    {
                        $addFields: {
                            percentage: {
                                $cond: [
                                    { $eq: ["$maxScore", 0] },
                                    0,
                                    { $multiply: [{ $divide: ["$totalScore", "$maxScore"] }, 100] }
                                ]
                            }
                        }
                    }
                ]);

                const user = await Usermodel.findById(id).select("username email classId profilePic userId");

                return {
                    studentName: user?.username || "مجهول",
                    studentEmail: user?.email || "",
                    profilePic: user?.profilePic || "",
                    classId: user?.classId || "",
                    userId: user?.userId || "",
                    totalScore: result[0]?.totalScore || 0,
                    maxScore: result[0]?.maxScore || 0,
                    percentage: `${Math.round(result[0]?.percentage || 0)}%`,
                    examsCount: result[0]?.examsCount || 0
                };
            };

            const userStats = await getUserStats(userId);
            const matchedStats = await getUserStats(matchedUser.userId);

            // ✅ إرسال البيانات للطرف الأول
            socket.emit("matched", {
                roomId,
                partnerId: matchedUser.userId,
                questions,
                me: userStats,
                opponent: matchedStats
            });

            // ✅ إرسال البيانات للطرف الثاني
            if (scketConnections.has(matchedUser.userId)) {
                socket
                    .to(scketConnections.get(matchedUser.userId))
                    .emit("matched", {
                        roomId,
                        partnerId: userId,
                        questions,
                        me: matchedStats,
                        opponent: userStats
                    });
            }

        } else {
            const timeout = setTimeout(() => {
                const index = waitingUsers.findIndex((u) => u.userId === userId);
                if (index !== -1) {
                    waitingUsers.splice(index, 1);
                    socket.emit("timeout", {
                        message: "⏳ انتهى وقت البحث، لم يتم العثور على شريك."
                    });
                }
            }, 2 * 60 * 1000); // دقيقتين

            waitingUsers.push({
                userId,
                classId,
                gender,
                lookingFor,
                socketId: socket.id,
                timeout
            });

            console.log("➕ تم إضافة المستخدم لقائمة الانتظار");

            socket.emit("waiting", {
                message: "⏳ جاري البحث عن شريك مطابق في نفس الصف الدراسي..."
            });
        }
    });

    // ✅ إزالة المستخدم عند قطع الاتصال
    socket.on("disconnect", () => {
        const index = waitingUsers.findIndex((u) => u.socketId === socket.id);
        if (index !== -1) {
            clearTimeout(waitingUsers[index].timeout);
            waitingUsers.splice(index, 1);
        }
    });
};




export const handleVoiceCall = (socket) => {
    socket.on("call-user", ({ toUserId, offer }) => {
        const toSocketId = scketConnections.get(toUserId);
        if (!toSocketId) return;
        console.log("📞 إرسال offer من", socket.user._id, "إلى", toUserId);
        socket.to(toSocketId).emit("receive-call", {
            fromUserId: socket.user._id,
            offer,
        });
    });

    socket.on("answer-call", ({ toUserId, answer }) => {
        const toSocketId = scketConnections.get(toUserId);
        if (!toSocketId) return;
        console.log("✅ الرد من", socket.user._id, "إلى", toUserId);
        socket.to(toSocketId).emit("call-answered", {
            fromUserId: socket.user._id,
            answer,
        });
    });

    socket.on("ice-candidate", ({ toUserId, candidate }) => {
        const toSocketId = scketConnections.get(toUserId);
        if (!toSocketId) return;
        console.log("🧊 ICE من", socket.user._id, "إلى", toUserId);
        socket.to(toSocketId).emit("ice-candidate", {
            fromUserId: socket.user._id,
            candidate,
        });
    });
};


const availableRooms = new Map();

// export const handleRoomCreation = (socket) => {
//     socket.on("createRoom", async ({ roomName, subjectId, chapterId, lessonId }) => {
//         const { data } = await authenticationSocket({ socket });

//         if (!data.valid) {
//             return socket.emit("socketErrorResponse", data);
//         }

//         const user = data.user;
//         const userId = user._id.toString();
//         const roomId = uuidv4(); // ID عشوائي للروم

//         try {
//             // 🔁 حفظ في قاعدة البيانات
//             const newRoom = await RoomSchemaModel.create({
//                 roomId,
//                 roomName,
//                 ownerId: userId,
//                 subjectId,
//                 chapterId,
//                 lessonId,
//                 classId: user.classId,
//                 users: [{ userId }]
//             });

//             // 💾 حفظ في الذاكرة المؤقتة
//             availableRooms.set(roomId, {
//                 roomId,
//                 roomName,
//                 ownerId: userId,
//                 subjectId,
//                 chapterId,
//                 lessonId,
//                 users: [{ userId, socketId: socket.id }],
//                 bannedUsers: [],
//                 isStarted: false
//             });

//             // 💬 رد للمستخدم بإنشاء الروم بنجاح
//             socket.emit("roomCreated", {
//                 message: "✅ تم إنشاء الروم بنجاح",
//                 roomId,
//                 roomName,
//                 subjectId,
//                 chapterId,
//                 lessonId
//             });

//             console.log("✅ تم إنشاء روم:", roomId);
//         } catch (err) {
//             console.error("❌ خطأ أثناء إنشاء الروم:", err);
//             socket.emit("socketErrorResponse", {
//                 message: "❌ حدث خطأ أثناء إنشاء الروم",
//                 error: err.message
//             });
//         }
//     });

//     // 🛑 تنظيف عند فصل الاتصال
//     socket.on("disconnect", () => {
//         for (const [roomId, room] of availableRooms) {
//             const index = room.users.findIndex((u) => u.socketId === socket.id);
//             if (index !== -1) {
//                 room.users.splice(index, 1);

//                 // لو مفيش أعضاء بالروم نحذفه
//                 if (room.users.length === 0) {
//                     availableRooms.delete(roomId);
//                 }
//                 break;
//             }
//         }
//     });
// };

// export { availableRooms };
export const handleRoomCreation = (socket) => {
    socket.on("createRoom", async ({ roomName, subjectId, chapterId, lessonId }) => {
        const { data } = await authenticationSocket({ socket });

        if (!data.valid) {
            return socket.emit("socketErrorResponse", data);
        }

        const user = data.user;
        const userId = user._id.toString();
        const roomId = uuidv4(); // ID عشوائي للروم

        try {
            // 🔁 حفظ في قاعدة البيانات
            const newRoom = await RoomSchemaModel.create({
                roomId,
                roomName,
                ownerId: userId,
                subjectId,
                chapterId,
                lessonId,
                classId: user.classId,
                users: [{ userId }]
            });

            // 💾 حفظ في الذاكرة المؤقتة
            availableRooms.set(roomId, {
                roomId,
                roomName,
                ownerId: userId,
                subjectId,
                chapterId,
                lessonId,
                users: [{ userId, socketId: socket.id }],
                bannedUsers: [],
                isStarted: false
            });

            // 💬 رد للمستخدم بإنشاء الروم بنجاح
            socket.emit("roomCreated", {
                message: "✅ تم إنشاء الروم بنجاح",
                roomId,
                roomName,
                subjectId,
                chapterId,
                lessonId
            });

            console.log("✅ تم إنشاء روم:", roomId);
        } catch (err) {
            console.error("❌ خطأ أثناء إنشاء الروم:", err);
            socket.emit("socketErrorResponse", {
                message: "❌ حدث خطأ أثناء إنشاء الروم",
                error: err.message
            });
        }
    });
};

export { availableRooms };





//     export const handleJoinRoom = (socket) => {
//     socket.on("joinRoom", async ({ roomId }) => {
//         try {
//             const { data } = await authenticationSocket({ socket });
//             if (!data.valid) return socket.emit("socketErrorResponse", data);

//             const user = data.user;
//             const userId = user._id.toString();

//             const room = await RoomSchemaModel.findOne({ roomId });
//             if (!room) {
//                 return socket.emit("socketErrorResponse", {
//                     message: "❌ الروم غير موجودة",
//                     status: 404,
//                 });
//             }

//             // ✅ فلترة الحظر المؤقت
//             room.bannedUsers = room.bannedUsers.filter(
//                 (u) => u.bannedUntil > new Date()
//             );
//             await room.save();
//             const updatedRoom = await RoomSchemaModel.findOne({ roomId }).populate("users.userId", "name avatar");
//             const updatedUsers = updatedRoom.users.map(u => ({
//                 userId: u.userId._id,
//                 name: u.userId.name,
//                 avatar: u.userId.avatar,
//             }));
//             socket.to(roomId).emit("roomUsersUpdated", updatedUsers);


//             const banned = room.bannedUsers.find(
//                 (u) => u.userId.toString() === userId && u.bannedUntil > new Date()
//             );

//             if (banned) {
//                 return socket.emit("socketErrorResponse", {
//                     message: "⛔️ لقد تم حظرك مؤقتًا من هذه الروم",
//                     status: 403,
//                 });
//             }

//             const alreadyIn = room.users.find((u) => u.userId.toString() === userId);
//             if (alreadyIn) {
//                 return socket.emit("socketErrorResponse", {
//                     message: "✅ أنت بالفعل داخل الروم",
//                     status: 200,
//                 });
//             }

//             if (room.users.length >= 5) {
//                 return socket.emit("socketErrorResponse", {
//                     message: "❌ الروم ممتلئة (الحد الأقصى 5 أشخاص)",
//                     status: 403,
//                 });
//             }

//             room.users.push({ userId });
//             await room.save();
//             socket.join(roomId);

//             console.log(`✅ ${user.username || user.name} انضم إلى الروم: ${roomId}`);

//             // إعلام الموجودين في الروم
//             socket.to(roomId).emit("newUserJoined", {
//                 userId,
//                 name: user.name,
//             });

//             // الرد للمستخدم
//             socket.emit("joinedRoomSuccessfully", {
//                 message: "✅ تم الانضمام للروم بنجاح",
//                 roomId,
//                 users: room.users,
//                 subjectId: room.subjectId,
//                 chapterId: room.chapterId,
//                 lessonId: room.lessonId,
//                 ownerId: room.ownerId,
//                 roomName: room.roomName,
//             });

//             // ✅ جلب الأسئلة تلقائيًا للمستخدم الجديد
//             if (room.lessonId) {
//                 const exam = await ExamModel.findOne({ lessonId: room.lessonId });
//                 if (exam && exam.questions.length) {
//                     const shuffled = exam.questions.sort(() => 0.5 - Math.random());
//                     const questions = shuffled.slice(0, 10);
//                     socket.emit("roomQuestions", {
//                         questions,
//                         message: "✅ هذه هي الأسئلة الخاصة بالروم",
//                     });
//                 }
//             }

//         } catch (err) {
//             console.error("❌ Error in joinRoom:", err);
//             socket.emit("socketErrorResponse", {
//                 message: "❌ خطأ أثناء محاولة الانضمام للروم",
//                 error: err.message,
//                 status: 500,
//             });
//         }
//     });
// };
    


    
export const handleJoinRoom = (socket) => {
    socket.on("joinRoom", async ({ roomId }) => {
        try {
            const { data } = await authenticationSocket({ socket });
            if (!data.valid) {
                console.log("❌ مصادقة غير صالحة:", data);
                return socket.emit("socketErrorResponse", data);
            }

            const user = data.user;
            const userId = user._id.toString();
            console.log(`🔐 المستخدم ${user.username || user.name} يحاول الانضمام إلى الروم: ${roomId}`);

            const room = await RoomSchemaModel.findOne({ roomId });
            if (!room) {
                console.log("❌ الروم غير موجودة");
                return socket.emit("socketErrorResponse", {
                    message: "❌ الروم غير موجودة",
                    status: 404,
                });
            }

            // فلترة الحظر المؤقت
            room.bannedUsers = room.bannedUsers.filter(
                (u) => u.bannedUntil > new Date()
            );
            await room.save();

            const banned = room.bannedUsers.find(
                (u) => u.userId.toString() === userId && u.bannedUntil > new Date()
            );
            if (banned) {
                console.log("⛔️ مستخدم محظور مؤقتًا:", userId);
                return socket.emit("socketErrorResponse", {
                    message: "⛔️ لقد تم حظرك مؤقتًا من هذه الروم",
                    status: 403,
                });
            }

            const alreadyIn = room.users.find((u) => u.userId.toString() === userId);
            if (alreadyIn) {
                console.log("🔁 المستخدم موجود بالفعل في الروم:", userId);
                return socket.emit("socketErrorResponse", {
                    message: "✅ أنت بالفعل داخل الروم",
                    status: 200,
                });
            }

            if (room.users.length >= 5) {
                console.log("❌ الروم ممتلئة:", roomId);
                return socket.emit("socketErrorResponse", {
                    message: "❌ الروم ممتلئة (الحد الأقصى 5 أشخاص)",
                    status: 403,
                });
            }

            // ✅ انضمام فعلي
            room.users.push({ userId });
            await room.save();
            socket.join(roomId);

            console.log(`✅ ${user.username || user.name} انضم إلى الروم: ${roomId}`);

            socket.to(roomId).emit("newUserJoined", {
                userId,
                name: user.name,
            });

            // جلب تفاصيل الروم وتحديث الجميع
            const updatedRoom = await RoomSchemaModel.findOne({ roomId })
                .populate("ownerId", "username profilePic")
                .populate("users.userId", "username profilePic")
                .populate("subjectId", "name")
                .populate("chapterId", "title")
                .populate("lessonId", "title");

            const usersList = updatedRoom.users.map((u) => ({
                userId: u.userId._id,
                username: u.userId.username,
                profilePic: u.userId.profilePic,
            }));

            const io = getIo();
            const roomData = {
                roomId: updatedRoom.roomId,
                roomName: updatedRoom.roomName,
                owner: {
                    userId: updatedRoom.ownerId._id,
                    username: updatedRoom.ownerId.username,
                    profilePic: updatedRoom.ownerId.profilePic,
                },
                users: usersList,
                subject: updatedRoom.subjectId?.name || null,
                chapter: updatedRoom.chapterId?.title || null,
                lesson: updatedRoom.lessonId?.title || null,
            };

            console.log("📡 إرسال roomDetailsUpdated:", JSON.stringify(roomData, null, 2));
            io.in(roomId).emit("roomDetailsUpdated", roomData);

            // ✅ رد للمستخدم نفسه
            socket.emit("joinedRoomSuccessfully", {
                message: "✅ تم الانضمام للروم بنجاح",
                roomId,
                users: usersList,
                subjectId: room.subjectId,
                chapterId: room.chapterId,
                lessonId: room.lessonId,
                ownerId: room.ownerId,
                roomName: room.roomName,
            });

            // ✅ إرسال الأسئلة
            if (room.lessonId) {
                const exam = await ExamModel.findOne({ lessonId: room.lessonId });
                if (exam && exam.questions.length) {
                    const shuffled = exam.questions.sort(() => 0.5 - Math.random());
                    const questions = shuffled.slice(0, 10);
                    console.log(`📘 تم إرسال ${questions.length} سؤال`);
                    socket.emit("roomQuestions", {
                        questions,
                        message: "✅ هذه هي الأسئلة الخاصة بالروم",
                    });
                } else {
                    console.log("⚠️ لا يوجد أسئلة في هذا الدرس");
                }
            }

        } catch (err) {
            console.error("❌ خطأ في joinRoom:", err);
            socket.emit("socketErrorResponse", {
                message: "❌ خطأ أثناء محاولة الانضمام للروم",
                error: err.message,
                status: 500,
            });
        }
    });
};


export const handleRoomEvents = (socket) => {
    socket.on("getRoomQuestions", async ({ roomId }) => {
        try {
            const { data } = await authenticationSocket({ socket });

            if (!data.valid) {
                return socket.emit("socketErrorResponse", data);
            }

            const userId = data.user._id;

            // 🧠 التأكد من وجود الروم
            const room = await RoomSchemaModel.findOne({ roomId });
            if (!room) {
                return socket.emit("socketErrorResponse", {
                    message: "❌ لم يتم العثور على الروم",
                });
            }

            // // 🔐 التأكد من أن المستخدم هو صاحب الروم
            // if (room.ownerId.toString() !== userId.toString()) {
            //     return socket.emit("socketErrorResponse", {
            //         message: "❌ ليس لديك صلاحية لجلب الأسئلة"
            //     });
            // }

            // ⚠️ التأكد من وجود lessonId
            if (!room.lessonId) {
                return socket.emit("socketErrorResponse", {
                    message: "❌ لا يمكن جلب الأسئلة بدون lessonId"
                });
            }

            // 📚 جلب الامتحان
            const exam = await ExamModel.findOne({ lessonId: room.lessonId });
            if (!exam || !exam.questions.length) {
                return socket.emit("socketErrorResponse", {
                    message: "❌ لا يوجد امتحان مسجل لهذا الدرس"
                });
            }

            // 🔀 اختيار عشوائي لـ 10 أسئلة
            const shuffled = exam.questions.sort(() => 0.5 - Math.random());
            const questions = shuffled.slice(0, 10);

            console.log("✅ تم جلب الأسئلة بنجاح:", questions.length);

            // 📤 إرسال الأسئلة للجميع في الروم (ما عدا المرسل)
            socket.to(roomId).emit("roomQuestions", {
                questions,
                message: "✅ تم إرسال الأسئلة للجميع"
            });

            // ⬅️ إرسال نسخة للمرسل نفسه أيضًا (اختياري)
            socket.emit("roomQuestions", {
                questions,
                message: "✅ تم إرسال الأسئلة لك"
            });

        } catch (err) {
            console.error("❌ خطأ أثناء جلب الأسئلة:", err);
            socket.emit("socketErrorResponse", {
                message: "❌ حدث خطأ أثناء جلب الأسئلة",
                error: err.message
            });
        }
    });
}


export const handleAvailableRoomsByClass = (socket) => {
    socket.on("getAvailableRooms", async () => {
        const { data } = await authenticationSocket({ socket });

        if (!data.valid) {
            return socket.emit("socketErrorResponse", data);
        }

        const user = data.user;
        const classId = user.classId;

        try {
            const rooms = await RoomSchemaModel.find({ classId }).populate("ownerId subjectId chapterId lessonId");

            socket.emit("availableRoomsList", {
                message: "✅ تم جلب الرومات المتاحة بنجاح",
                rooms
            });
        } catch (error) {
            console.error("❌ خطأ أثناء جلب الرومات:", error);
            socket.emit("socketErrorResponse", {
                message: "❌ حدث خطأ أثناء جلب الرومات المتاحة",
                error: error.message
            });
        }
    });
};





export const handleKickUserFromRoom = (socket) => {
    socket.on("kickUserFromRoom", async ({ roomId, targetUserId }) => {
        try {
            const { data } = await authenticationSocket({ socket });

            if (!data.valid) {
                return socket.emit("socketErrorResponse", data);
            }

            const requester = data.user;
            const requesterId = requester._id.toString();

            // جلب الروم
            const room = await RoomSchemaModel.findOne({ roomId });

            if (!room) {
                return socket.emit("socketErrorResponse", {
                    message: "❌ الروم غير موجودة",
                    status: 404,
                });
            }

            // التأكد من أن صاحب الروم هو اللي بيطرد
            if (room.ownerId.toString() !== requesterId) {
                return socket.emit("socketErrorResponse", {
                    message: "🚫 غير مصرح لك بطرد المستخدمين",
                    status: 403,
                });
            }

            // حظر لمدة 24 ساعة
            const bannedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
            room.bannedUsers.push({ userId: targetUserId, bannedUntil });

            // حذف من قاعدة البيانات
            room.users = room.users.filter((u) => u.userId.toString() !== targetUserId);
            await room.save();

            // حذف من الذاكرة
            const memRoom = availableRooms.get(roomId);
            if (memRoom) {
                memRoom.users = memRoom.users.filter((u) => u.userId !== targetUserId);
            }

            // إخراج المستخدم من الروم socket.io
            const targetSocket = memRoom?.users?.find(u => u.userId === targetUserId)?.socketId;
            if (targetSocket) {
                socket.to(targetSocket).emit("kickedFromRoom", {
                    message: "🚫 تم طردك من الروم لمدة 24 ساعة"
                });

                socket.to(targetSocket).socketsLeave(roomId);
            }

            // إعلام كل الموجودين في الروم
            socket.to(roomId).emit("userKickedNotification", {
                message: `🚫 تم طرد مستخدم من الروم بواسطة ${requester.name}`,
                targetUserId,
            });

            // إعلام صاحب الروم بنجاح الطرد
            socket.emit("userKickedSuccess", {
                message: "✅ تم طرد المستخدم بنجاح وحظره لمدة 24 ساعة"
            });

            console.log(`🚫 تم طرد المستخدم ${targetUserId} من الروم ${roomId}`);

        } catch (err) {
            console.error(err);
            socket.emit("socketErrorResponse", {
                message: "❌ حدث خطأ أثناء محاولة الطرد",
                error: err.message,
                status: 500,
            });
        }
    });
};


export const handleLeaveRoom = (socket) => {
    socket.on("leaveRoom", async ({ roomId }) => {
        try {
            const { data } = await authenticationSocket({ socket });

            if (!data.valid) {
                return socket.emit("socketErrorResponse", data);
            }

            const user = data.user;
            const userId = user._id.toString();

            const room = await RoomSchemaModel.findOne({ roomId });

            if (!room) {
                return socket.emit("socketErrorResponse", {
                    message: "❌ الروم غير موجودة",
                    status: 404,
                });
            }

            // 🧾 حذف المستخدم من قاعدة البيانات
            const dbResult = await RoomSchemaModel.updateOne(
                { roomId },
                { $pull: { users: { userId } } }
            );

            // 🧠 حذف من الذاكرة المؤقتة
            if (availableRooms.has(roomId)) {
                const memoryRoom = availableRooms.get(roomId);
                memoryRoom.users = memoryRoom.users.filter(
                    (u) => u.userId !== userId
                );

                if (memoryRoom.users.length === 0) {
                    availableRooms.delete(roomId);
                }
            }

            // الخروج من الغرفة فعليًا
            socket.leave(roomId);

            // إعلام باقي الأعضاء
            socket.to(roomId).emit("userLeftRoom", {
                userId,
                name: user.name || user.username,
            });

            // تأكيد للمستخدم
            socket.emit("leftRoomSuccessfully", {
                message: "✅ تم الخروج من الروم بنجاح",
                roomId,
            });

            console.log(`👋 ${user.name || user.username} خرج من الروم ${roomId}`);

        } catch (err) {
            console.error("❌ خطأ في leaveRoom:", err);
            socket.emit("socketErrorResponse", {
                message: "❌ خطأ أثناء محاولة الخروج من الروم",
                error: err.message,
                status: 500,
            });
        }
    });
};



export const updateRoomLesson = (socket) => {
    socket.on("updateRoomLesson", async ({ roomId, newLessonId }) => {
        try {
            const { data } = await authenticationSocket({ socket });
            if (!data.valid) return socket.emit("socketErrorResponse", data);

            const userId = data.user._id;
            const room = await RoomSchemaModel.findOne({ roomId });

            if (!room) {
                return socket.emit("socketErrorResponse", {
                    message: "❌ الروم غير موجودة",
                });
            }

            if (room.ownerId.toString() !== userId.toString()) {
                return socket.emit("socketErrorResponse", {
                    message: "❌ فقط صاحب الروم يمكنه تغيير الدرس",
                });
            }

            // ✅ تحديث الدرس
            room.lessonId = newLessonId;

            const exam = await ExamModel.findOne({ lessonId: newLessonId });

            if (!exam || !exam.questions.length) {
                return socket.emit("socketErrorResponse", {
                    message: "❌ لا يوجد امتحان لهذا الدرس",
                });
            }

            const shuffled = exam.questions.sort(() => 0.5 - Math.random());
            const questions = shuffled.slice(0, 10);

            // ✅ حفظ الأسئلة داخل الروم (اختياري إذا أردت إرسالها تلقائيًا للمنضمين لاحقًا)
            room.questions = questions;
            await room.save();

            // إرسال للجميع في الروم (بما فيهم المرسل)
            socket.to(roomId).emit("roomQuestions", {
                questions,
                message: "✅ تم تحديث الأسئلة بعد تغيير الدرس"
            });

            socket.emit("roomQuestions", {
                questions,
                message: "✅ تم إرسال الأسئلة لك بعد تغيير الدرس"
            });

        } catch (err) {
            console.error("❌ خطأ أثناء تغيير الدرس:", err);
            socket.emit("socketErrorResponse", {
                message: "❌ حدث خطأ أثناء تغيير الدرس",
                error: err.message
            });
        }
    });
};





export const handleGetRoomDetailsById = (socket) => {
    socket.on("getRoomDetailsById", async ({ roomId }) => {
        try {
            const { data } = await authenticationSocket({ socket });
            if (!data.valid) return socket.emit("socketErrorResponse", data);

            const room = await RoomSchemaModel.findOne({ roomId })
                .populate("ownerId", "username profilePic")
                .populate("users.userId", "username profilePic")
                .populate("subjectId", "name")
                .populate("chapterId", "title")
                .populate("lessonId", "title");

            if (!room) {
                return socket.emit("socketErrorResponse", {
                    message: "❌ الروم غير موجودة",
                });
            }

            // تجهيز البيانات للإرسال
            const usersList = room.users.map((u) => ({
                userId: u.userId._id,
                username: u.userId.username,
                profilePic: u.userId.profilePic,
            }));

            socket.emit("roomDetails", {
                roomId: room.roomId,
                roomName: room.roomName,
                owner: {
                    userId: room.ownerId._id,
                    username: room.ownerId.username,
                    profilePic: room.ownerId.profilePic,
                },
                users: usersList,
                subject: room.subjectId?.name || null,
                chapter: room.chapterId?.title || null,
                lesson: room.lessonId?.title || null,
            });

        } catch (err) {
            console.error("❌ Error in getRoomDetailsById:", err);
            socket.emit("socketErrorResponse", {
                message: "❌ فشل في جلب تفاصيل الروم",
                error: err.message,
            });
        }
    });
};
