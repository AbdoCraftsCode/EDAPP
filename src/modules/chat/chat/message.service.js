import { ChatModel } from "../../../DB/models/chaatmodel.js";
// import { scketConnections } from "../../../DB/models/User.model.js";
import { authenticationSocket } from "../../../middlewere/auth.socket.middlewere.js";
import * as dbservice from "../../../DB/dbservice.js"
import { scketConnections } from "../../../DB/models/User.model.js";
import mongoose from 'mongoose';





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
  





// export const sendMessage = (socket) => {
//     socket.on("sendMessage", async (messageData) => {
//         try {
//             const { data } = await authenticationSocket({ socket });

//             if (!data.valid) {
//                 return socket.emit("socketErrorResponse", data);
//             }

//             const user = data.user;
//             const userId = user._id.toString();
//             const { message } = messageData;

//             if (!message || typeof message !== 'string' || message.trim().length === 0) {
//                 return socket.emit("socketErrorResponse", {
//                     message: "❌ الرسالة لا يمكن أن تكون فارغة",
//                     status: 400
//                 });
//             }

//             // 🔍 طباعة للتأكيد
//             console.log("📩 استقبلنا رسالة:", messageData);

//             // ✅ جلب أو إنشاء الشات الجماعي
//             let chat = await ChatModel.findOne();

//             if (!chat) {
//                 chat = await ChatModel.create({
//                     participants: [user._id],
//                     messages: []
//                 });
//                 console.log("✅ تم إنشاء شات جديد:", chat._id.toString());
//             }

//             // ✅ إضافة المستخدم للمشاركين إن لم يكن موجودًا
//             const isParticipant = chat.participants
//                 .map((p) => p.toString())
//                 .includes(userId);

//             if (!isParticipant) {
//                 chat.participants.push(user._id);
//                 console.log("➕ تم إضافة المستخدم للمشاركين");
//             }

//             // ✅ إنشاء الرسالة
//             const messageId = new mongoose.Types.ObjectId();

//             const messageDoc = {
//                 _id: messageId,
//                 message,
//                 senderId: user._id
//             };

//             // ✅ إضافة الرسالة للمحادثة
//             chat.messages.push(messageDoc);

//             // ✅ حفظ الشات في قاعدة البيانات
//             await chat.save();

//             console.log("✅ الرسالة تم حفظها في MongoDB:", messageDoc);

//             // ✅ تجهيز الرسالة بنفس تنسيق الـ API
//             const messageToSend = {
//                 _id: messageId,
//                 message,
//                 senderId: {
//                     _id: user._id,
//                     username: user.username
//                 }
//             };

//             // ✅ إرسال الرسالة للمشاركين (ما عدا المرسل)
//             for (const participantId of chat.participants) {
//                 const participantStr = participantId.toString();
//                 if (
//                     participantStr !== userId &&
//                     scketConnections.has(participantStr)
//                 ) {
//                     socket
//                         .to(scketConnections.get(participantStr))
//                         .emit("receiveMessage", messageToSend);
//                 }
//             }

//             // ✅ إرسال الرد للمرسل نفسه
//             socket.emit("successMessage", {
//                 message: messageToSend
//             });
//         } catch (error) {
//             console.error("❌ خطأ أثناء الإرسال:", error);
//             socket.emit("socketErrorResponse", {
//                 message: "❌ حدث خطأ أثناء إرسال الرسالة",
//                 status: 500
//             });
//         }
//     });
//   };
  
