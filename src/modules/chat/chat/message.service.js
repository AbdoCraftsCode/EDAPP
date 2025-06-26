import { ChatModel } from "../../../DB/models/chaatmodel.js";
// import { scketConnections } from "../../../DB/models/User.model.js";
import { authenticationSocket } from "../../../middlewere/auth.socket.middlewere.js";
import * as dbservice from "../../../DB/dbservice.js"
import { scketConnections } from "../../../DB/models/User.model.js";
import mongoose from 'mongoose';








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
  

const waitingUsers = [];

export const handleMatching = (socket) => {
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

        // طباعة القائمة قبل أي شيء
        console.log("📃 قائمة الانتظار الحالية:", waitingUsers);

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

            console.log("✅ تمت المطابقة:", { user1: userId, user2: matchedUser.userId });

            socket.emit("matched", { roomId, partnerId: matchedUser.userId });

            if (scketConnections.has(matchedUser.userId)) {
                socket
                    .to(scketConnections.get(matchedUser.userId))
                    .emit("matched", { roomId, partnerId: userId });
            }

        } else {
            const timeout = setTimeout(() => {
                const index = waitingUsers.findIndex((u) => u.userId === userId);
                if (index !== -1) {
                    waitingUsers.splice(index, 1);
                    socket.emit("timeout", {
                        message: "⏳ انتهى وقت البحث، لم يتم العثور على شريك.",
                    });
                }
            }, 2 * 60 * 1000);

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
                message: "⏳ جاري البحث عن شريك مطابق في نفس الصف الدراسي...",
            });
        }
    });

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



  
