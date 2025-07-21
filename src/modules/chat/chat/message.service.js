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

            // لازم على الأقل حاجة واحدة
            const nothingSent = [message, voiceUrl, imageUrl, fileUrl]
                .every(val => !val || (typeof val === "string" && val.trim() === ""));

            if (nothingSent) {
                return socket.emit("socketErrorResponse", {
                    message: "❌ لا يمكن إرسال رسالة فارغة.",
                    status: 400
                });
            }

            // جلب أو إنشاء الشات
            let chat = await ChatModel.findOne();
            if (!chat) {
                chat = await ChatModel.create({
                    participants: [user._id],
                    messages: []
                });
            }

            // إضافة المستخدم للمشاركين
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

    // 🛑 تنظيف عند فصل الاتصال
    socket.on("disconnect", () => {
        for (const [roomId, room] of availableRooms) {
            const index = room.users.findIndex((u) => u.socketId === socket.id);
            if (index !== -1) {
                room.users.splice(index, 1);

                // لو مفيش أعضاء بالروم نحذفه
                if (room.users.length === 0) {
                    availableRooms.delete(roomId);
                }
                break;
            }
        }
    });
};

export { availableRooms };

  



export const handleJoinRoom = (socket) => {
    socket.on("joinRoom", async ({ roomId }) => {
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

            // هل تم حظره؟
            const banned = room.bannedUsers.find(
                (u) => u.userId.toString() === userId && u.bannedUntil > new Date()
            );

            if (banned) {
                return socket.emit("socketErrorResponse", {
                    message: "⛔️ لقد تم حظرك مؤقتًا من هذه الروم",
                    status: 403,
                });
            }

            // هل هو بالفعل داخل الروم؟
            const alreadyIn = room.users.find((u) => u.userId.toString() === userId);
            if (alreadyIn) {
                return socket.emit("socketErrorResponse", {
                    message: "✅ أنت بالفعل داخل الروم",
                    status: 200,
                });
            }

            // هل الروم ممتلئة؟
            if (room.users.length >= 5) {
                return socket.emit("socketErrorResponse", {
                    message: "❌ الروم ممتلئة (الحد الأقصى 5 أشخاص)",
                    status: 403,
                });
            }

            // ضيف المستخدم في الروم
            room.users.push({ userId });
            await room.save();

            // انضم للروم socket.io
            socket.join(roomId);

            console.log(`✅ ${user.name} انضم إلى الروم: ${roomId}`);

            // إعلام باقي الأعضاء
            socket.to(roomId).emit("newUserJoined", {
                userId,
                name: user.name,
            });

            // الرد على المستخدم نفسه
            socket.emit("joinedRoomSuccessfully", {
                message: "✅ تم الانضمام للروم بنجاح",
                roomId,
                users: room.users,
                subjectId: room.subjectId,
                chapterId: room.chapterId,
                lessonId: room.lessonId,
                ownerId: room.ownerId,
                roomName: room.roomName,
            });

        } catch (err) {
            console.error(err);
            socket.emit("socketErrorResponse", {
                message: "❌ خطأ أثناء محاولة الانضمام للروم",
                error: err.message,
                status: 500,
            });
        }
    });
};


export const handleRoomEvents = (io, socket) => {
    socket.on("getRoomQuestions", async ({ roomId }) => {
        try {
            const { data } = await authenticationSocket({ socket });
            if (!data.valid) {
                return socket.emit("socketErrorResponse", data);
            }

            const userId = data.user._id;

            const room = await RoomModel.findOne({ roomId });
            if (!room) {
                return socket.emit("socketErrorResponse", {
                    message: "❌ لم يتم العثور على الروم",
                });
            }

            if (room.ownerId.toString() !== userId.toString()) {
                return socket.emit("socketErrorResponse", {
                    message: "❌ ليس لديك صلاحية لتغيير الأسئلة"
                });
            }

            if (!room.chapterId || !room.lessonId) {
                return socket.emit("socketErrorResponse", {
                    message: "❌ لا يمكن جلب الأسئلة بدون الشابتر والدرس"
                });
            }

            const questions = await GeneralQuestionModel.aggregate([
                {
                    $match: {
                        classId: new mongoose.Types.ObjectId(room.subjectId),
                        chapterId: new mongoose.Types.ObjectId(room.chapterId),
                        lessonId: new mongoose.Types.ObjectId(room.lessonId)
                    }
                },
                { $sample: { size: 10 } }
            ]);

            console.log("✅ تم جلب الأسئلة بنجاح:", questions.length);

            // إرسال الأسئلة للجميع في الغرفة
            io.to(roomId).emit("roomQuestions", {
                questions,
                message: "✅ تم إرسال الأسئلة للجميع"
            });

        } catch (err) {
            console.error(err);
            socket.emit("socketErrorResponse", {
                message: "❌ حدث خطأ أثناء جلب الأسئلة",
                error: err.message
            });
        }
    });
};

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
