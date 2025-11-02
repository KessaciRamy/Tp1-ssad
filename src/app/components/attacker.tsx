"use client";

import { useEffect, useState } from "react";
import { ListRestart } from "lucide-react";


export interface Message {
  id: number;
  content: string;
  algorithm: string;
  key: string;
  decryptedContent?: string;
}

export function MessageManager() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch messages (decrypted automatically)
  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/MITM/intercept");
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      } else {
        setError("Failed to load messages");
      }
    } catch {
      setError("Server error while loading messages");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Handle modify button click
  const handleEditClick = (message: Message) => {
    setEditingMessageId(message.id);
    setNewContent(message.decryptedContent || message.content);
  };

  // Handle save
  const handleSave = async (id: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/message/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      });

      const data = await res.json();
      if (data.success) {
        setEditingMessageId(null);
        fetchMessages(); // Refresh list
      } else {
        setError("Failed to update message");
      }
    } catch {
      setError("Server error while saving");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
        <div
        className="flex justify-around">
      <h2 className="text-lg font-semibold text-slate-200 mb-2">Messages</h2>
        <button
        onClick={fetchMessages}
        className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
        disabled={loading}>
            <ListRestart />
        </button>
        </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {messages.map((message) => (
        <div
          key={message.id}
          className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 backdrop-blur-sm hover:border-slate-600/50 transition-colors relative"
        >
          {editingMessageId === message.id ? (
            <div className="flex flex-col space-y-2">
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full p-2 text-sm text-slate-100 bg-slate-700/50 rounded border border-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
                rows={3}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setEditingMessageId(null)}
                  className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(message.id)}
                  className="px-3 py-1 text-xs bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-slate-300 font-mono text-sm break-words">
                {message.decryptedContent || message.content}
              </p>
              <button
                onClick={() => handleEditClick(message)}
                className="absolute top-3 right-3 bg-cyan-600 hover:bg-cyan-700 text-white text-xs px-3 py-1 rounded-lg"
              >
                Modify
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
