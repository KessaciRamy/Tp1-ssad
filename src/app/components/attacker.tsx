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
  const [message, setMessage] = useState<Message | null>(null);
  const [editing, setEditing] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch the latest message
  const fetchMessage = async () => {
    try {
      setError("");
      const res = await fetch("/api/MITM/intercept");
      const data = await res.json();
      if (data.success) {
        // Adjust depending on API: message or messages[0]
        setMessage(data.message || data.messages?.[0] || null);
      } else {
        setError("Failed to load message");
      }
    } catch {
      setError("Server error while loading message");
    }
  };

  useEffect(() => {
    fetchMessage();
  }, []);

  // Save modifications
  const handleSave = async () => {
    if (!message) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/message/${message.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      });

      const data = await res.json();
      if (data.success) {
        setEditing(false);
        fetchMessage();
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
      <div className="flex justify-around items-center">
        <h2 className="text-lg font-semibold text-slate-200 mb-2">Latest Message</h2>
        <button
          onClick={fetchMessage}
          className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
          disabled={loading}
        >
          <ListRestart />
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {message ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 backdrop-blur-sm hover:border-slate-600/50 transition-colors relative">
          {editing ? (
            <div className="flex flex-col space-y-2">
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full p-2 text-sm text-slate-100 bg-slate-700/50 rounded border border-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
                rows={3}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setEditing(false)}
                  className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
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
                onClick={() => {
                  setEditing(true);
                  setNewContent(message.decryptedContent || message.content);
                }}
                className="absolute top-3 right-3 bg-cyan-600 hover:bg-cyan-700 text-white text-xs px-3 py-1 rounded-lg"
              >
                Modify
              </button>
            </>
          )}
        </div>
      ) : (
        <p className="text-slate-400 text-sm text-center italic">No messages yet</p>
      )}
    </div>
  );
}
