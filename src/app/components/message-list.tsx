"use client";

import { useEffect, useState } from "react";
import { PopupSettings } from "./settings"; 

export interface message {
  id: number;
  content: string;
  algorithm: string;
  key: string;
}

export function MessageList() {
  const [messages, setMessages] = useState<message[]>([]);
  const [decryptedMessages, setDecryptedMessages] = useState<{ [key: number]: string }>({});
  const [errors, setErrors] = useState<{ [key: number]: string }>({});
  const [activeMessage, setActiveMessage] = useState<number | null>(null); // popup target
  const [showPopup, setShowPopup] = useState(false);

  const fetchMessages = async () => {
    const res = await fetch("/api/message");
    const data = await res.json();
    if (data.success) setMessages(data.messages);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDecrypt = async (id: number, algorithm: string, key: string) => {
    try {
      const res = await fetch("/api/message/decrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: id, algorithm, key }),
      });

      const data = await res.json();

      if (data.success) {
        setDecryptedMessages((prev) => ({
          ...prev,
          [id]: data.decryptedContent,
        }));
        setErrors((prev) => ({ ...prev, [id]: "" })); // clear old error
      } else {
        setErrors((prev) => ({ ...prev, [id]: "❌ Wrong algorithm or key" }));
      }
    } catch (err) {
      setErrors((prev) => ({ ...prev, [id]: "⚠️ Server error" }));
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {messages.map((message) => (
        <div
          key={message.id}
          className="relative bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 backdrop-blur-sm hover:border-slate-600/50 transition-colors"
        >
          {/* Decrypt button */}
          <button
            onClick={() => {
              setActiveMessage(message.id);
              setShowPopup(true);
            }}
            className="absolute top-3 right-3 bg-cyan-600 hover:bg-cyan-700 text-white text-xs px-3 py-1 rounded-lg z-10"
          >
            Decrypt
          </button>

          {/* Encrypted / decrypted content */}
          <p className="text-slate-300 font-mono text-sm break-words">
            {decryptedMessages[message.id] || message.content}
          </p>

          {/* Error message */}
          {errors[message.id] && (
            <p className="text-red-400 text-xs mt-2">{errors[message.id]}</p>
          )}
        </div>
      ))}

      {/* Popup for entering key + algorithm */}
      {showPopup && activeMessage !== null && (
        <PopupSettings
          show={showPopup}
          onClose={() => setShowPopup(false)}
          onSave={(values) => {
            handleDecrypt(activeMessage, values.algorithm, values.key);
            setShowPopup(false);
          }}
        />
      )}
    </div>
  );
}
