"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";

export function useSocket(room) {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/messages?room=${room}`);
        const data = await res.json();
        if (data.success) setMessages(data.messages);
      } catch (err) {
        console.error("Failed to fetch message history:", err);
      }
    };

    fetchHistory();

    const socket = getSocket();
    socketRef.current = socket;

    socket.emit("join_room", room);

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    if (socket.connected) setConnected(true);

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [room]);

  const sendMessage = async (author, content) => {
    const socket = socketRef.current;
    if (!socket || !content.trim()) return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const messageData = { room, author, content, time };

    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });
    } catch (err) {
      console.error("Failed to save message:", err);
    }

    socket.emit("send_message", messageData);
  };

  return { messages, connected, sendMessage };
}