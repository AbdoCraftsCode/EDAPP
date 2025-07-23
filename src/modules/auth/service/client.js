
// import { io } from "socket.io-client";

// const socket = io("http://localhost:3000", {
//     path: "/socket.io",
//     auth: {
//         authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzdlYTRkYWE2NjY0MWZiNjAzMDE4OCIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzUzMTI0MjEyLCJleHAiOjE3ODQ2NjAyMTJ9.EDibWwvtGVcZO4pi4tqjGX75G8R89FN1pRKeSZRK5U0"
//     }
// });

// socket.on("connect", () => {
//     console.log("✅ Connected to server");

//     // ✅ هنا بيتم إنشاء الروم
//     socket.emit("createRoom", {
//         roomName: "روم تجربة الآن",
//         subjectId: "math101",
//         chapterId: "ch1",
//         lessonId: "ls1"
//     });
// });

// socket.on("roomCreated", (data) => {
//     console.log("🎉 روم اتعمل:", data);
// });

// socket.on("socketErrorResponse", (error) => {
//     console.log("❌ Error:", error);
// });

// socket.on("disconnect", () => {
//     console.log("🔌 Disconnected from server");
// });