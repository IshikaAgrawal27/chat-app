"use client";

import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
  if (typeof window === "undefined") return null;

  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};