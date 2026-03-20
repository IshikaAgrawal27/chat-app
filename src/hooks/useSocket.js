"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getSocket } from "@/lib/socket";

export function useSocket(room) {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Don't do anything if room is empty (user hasn't joined yet)
    if (!room) return;

    const socket = getSocket();
    if (!socket) return; // SSR guard

    socketRef.current = socket;

    // Fetch message history from DB
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

    // Join room — if socket is already connected, join immediately.
    // If not connected yet, join once connected.
    const joinRoom = () => {
      socket.emit("join_room", room);
    };

    if (socket.connected) {
      setConnected(true);
      joinRoom();
    }

    socket.on("connect", () => {
      setConnected(true);
      joinRoom(); // Re-join room on reconnect
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [room]);

  const sendMessage = useCallback(
    async (author, content) => {
      const socket = socketRef.current;
      if (!socket || !content.trim()) return;

      const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const messageData = { room, author, content, time };

      // Emit the socket event first for instant delivery
      socket.emit("send_message", messageData);

      // Then persist to DB in the background
      try {
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(messageData),
        });
      } catch (err) {
        console.error("Failed to save message:", err);
      }
    },
    [room]
  );

  return { messages, connected, sendMessage };
}