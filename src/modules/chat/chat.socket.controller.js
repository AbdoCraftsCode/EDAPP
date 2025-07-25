import { Server } from "socket.io";
import { logoutSocket, regiserSocket } from "./chat/chat.auth.service.js";
import { handleAvailableRoomsByClass, handleGetRoomDetailsById, handleJoinRoom, handleKickUserFromRoom, handleLeaveRoom, handleMatching, handleRoomCreation,  handleRoomEvents,  handleVoiceCall, sendMessage, updateRoomLesson } from "./chat/message.service.js";
import { authenticationSocket } from "../../middlewere/auth.socket.middlewere.js";



let io = undefined

export const runIo = (httpServer) => {
  io = new Server(httpServer, {
        cors: "*"
    });


    io.use(async (socket, next) => {
        const { data } = await authenticationSocket({ socket });
        if (!data?.valid) {
            return next(new Error(data.message || "Unauthorized"));
        }
        socket.user = data.user; // 🟢 هنا الإضافة المهمة جدًا
        return next();
    });

    return io.on("connection", async (socket) => {
        console.log(socket.handshake.auth);
        await sendMessage(socket);
        await regiserSocket(socket);
        await logoutSocket(socket);
        await handleMatching(socket);
        await handleVoiceCall(socket);
        await handleRoomCreation(socket);
        await handleAvailableRoomsByClass(socket);
        await handleKickUserFromRoom(socket);
        await handleLeaveRoom(socket);
        await handleRoomEvents(socket); 
        await updateRoomLesson(socket); 
        await handleGetRoomDetailsById(socket); 
        await handleJoinRoom(socket);
    });


}


export const getIo = () => {
    
    return io
}