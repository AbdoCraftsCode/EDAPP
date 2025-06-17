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
            const { message } = messageData;

            if (!message || typeof message !== 'string' || message.trim().length === 0) {
                return socket.emit("socketErrorResponse", {
                    message: "❌ الرسالة لا يمكن أن تكون فارغة",
                    status: 400
                });
            }

            // 🔍 طباعة للتأكيد
            console.log("📩 استقبلنا رسالة:", messageData);

            // ✅ جلب أو إنشاء الشات الجماعي
            let chat = await ChatModel.findOne();

            if (!chat) {
                chat = await ChatModel.create({
                    participants: [user._id],
                    messages: []
                });
                console.log("✅ تم إنشاء شات جديد:", chat._id.toString());
            }

            // ✅ إضافة المستخدم للمشاركين إن لم يكن موجودًا
            const isParticipant = chat.participants
                .map((p) => p.toString())
                .includes(userId);

            if (!isParticipant) {
                chat.participants.push(user._id);
                console.log("➕ تم إضافة المستخدم للمشاركين");
            }

            // ✅ إنشاء الرسالة
            const messageId = new mongoose.Types.ObjectId();

            const messageDoc = {
                _id: messageId,
                message,
                senderId: user._id
            };

            // ✅ إضافة الرسالة للمحادثة
            chat.messages.push(messageDoc);

            // ✅ حفظ الشات في قاعدة البيانات
            await chat.save();

            console.log("✅ الرسالة تم حفظها في MongoDB:", messageDoc);

            // ✅ تجهيز الرسالة بنفس تنسيق الـ API
            const messageToSend = {
                _id: messageId,
                message,
                senderId: {
                    _id: user._id,
                    username: user.username
                }
            };

            // ✅ إرسال الرسالة للمشاركين (ما عدا المرسل)
            for (const participantId of chat.participants) {
                const participantStr = participantId.toString();
                if (
                    participantStr !== userId &&
                    scketConnections.has(participantStr)
                ) {
                    socket
                        .to(scketConnections.get(participantStr))
                        .emit("receiveMessage", messageToSend);
                }
            }

            // ✅ إرسال الرد للمرسل نفسه
            socket.emit("successMessage", {
                message: messageToSend
            });
        } catch (error) {
            console.error("❌ خطأ أثناء الإرسال:", error);
            socket.emit("socketErrorResponse", {
                message: "❌ حدث خطأ أثناء إرسال الرسالة",
                status: 500
            });
        }
    });
  };
  
// export const sendMessage = (socket) => {
//     return socket.on("sendMessage", async (messageData) => {
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
//                     message: "الرسالة لا يمكن أن تكون فارغة",
//                     status: 400
//                 });
//             }

//             // جلب الشات الجماعي أو إنشاؤه
//             const chat = await ChatModel.findOne();

//             let newMessage = {
//                 _id: new mongoose.Types.ObjectId(),
//                 message,
//                 senderId: {
//                     _id: user._id,
//                     username: user.username
//                 }
//             };

//             if (!chat) {
//                 // إنشاء الشات لأول مرة
//                 await ChatModel.create({
//                     participants: [userId],
//                     messages: [{
//                         message,
//                         senderId: userId
//                     }]
//                 });
//             } else {
//                 // إضافة المشارك لو مش موجود
//                 if (!chat.participants.includes(userId)) {
//                     chat.participants.push(userId);
//                 }

//                 // إضافة الرسالة
//                 chat.messages.push({ message, senderId: userId });
//                 await chat.save();
//             }

//             // بث الرسالة بنفس تنسيق الـ API
//             for (const participantId of chat.participants) {
//                 const participantStr = participantId.toString();
//                 if (participantStr !== userId && scketConnections.has(participantStr)) {
//                     socket.to(scketConnections.get(participantStr)).emit("receiveMessage", newMessage);
//                 }
//             }

//             // إرسال الرسالة للمرسل نفسه لعرضها فورًا
//             socket.emit("successMessage", { message: newMessage });

//         } catch (error) {
//             console.error("Error sending message:", error);
//             socket.emit("socketErrorResponse", {
//                 message: "حدث خطأ داخلي أثناء إرسال الرسالة",
//                 status: 500
//             });
//         }
//     });
// };
