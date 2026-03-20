import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_APP_URL || "https://chat-app-wheat-three-10.vercel.app", {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};