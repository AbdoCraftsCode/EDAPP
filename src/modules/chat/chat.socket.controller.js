import { Server } from "socket.io";
import { logoutSocket, regiserSocket } from "./chat/chat.auth.service.js";
import { handleJoinRoom, handleMatching, handleRoomCreation, handleVoiceCall, sendMessage } from "./chat/message.service.js";



let io = undefined

export const runIo = (httpServer) => {
  io = new Server(httpServer, {
        cors: "*"
    });




    return io.on("connection", async (socket) => {
        console.log(socket.handshake.auth);
        await sendMessage(socket);
        await regiserSocket(socket);
        await logoutSocket(socket);
        await handleMatching(socket);
        await handleVoiceCall(socket);
        await handleRoomCreation(socket);
        await handleJoinRoom(socket);
    });


}


export const getIo = () => {
    
    return io
}