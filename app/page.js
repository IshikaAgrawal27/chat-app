"use client";

import { useState, useRef, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import MessageBubble from "@/components/MessageBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const ROOM = "general";

export default function ChatPage() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [inputName, setInputName] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const bottomRef = useRef(null);

  const { messages, connected, sendMessage } = useSocket(ROOM);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleJoin = () => {
    if (!inputName.trim()) return;
    setUsername(inputName.trim());
    setJoined(true);
  };

  const handleSend = () => {
    if (!messageInput.trim()) return;
    sendMessage(username, messageInput.trim());
    setMessageInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  if (!joined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm flex flex-col gap-4">
          <h1 className="text-2xl font-semibold text-slate-800 text-center">
            Join Chat
          </h1>
          <p className="text-sm text-slate-400 text-center">
            Enter a username to get started
          </p>
          <Input
            placeholder="Your username"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            autoFocus
          />
          <Button onClick={handleJoin} className="w-full">
            Enter Room
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-lg flex flex-col h-[600px]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white text-sm font-medium">
              {username[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">{username}</p>
              <p className="text-xs text-slate-400">#{ROOM}</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-xs ${
              connected
                ? "border-green-400 text-green-600"
                : "border-red-300 text-red-400"
            }`}
          >
            {connected ? "● Live" : "○ Offline"}
          </Badge>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {messages.length === 0 && (
            <p className="text-center text-xs text-slate-300 mt-8">
              No messages yet. Say hello!
            </p>
          )}
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              message={msg}
              isOwn={msg.author === username}
            />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-slate-100">
          <Input
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <Button onClick={handleSend} disabled={!messageInput.trim()}>
            Send
          </Button>
        </div>

      </div>
    </main>
  );
}