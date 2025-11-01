"use client";
import { useState, useEffect } from "react";
import {Send} from "lucide-react"

export interface message{
    id: Number,
    content: string
    algorithm: string
    key: string
}
interface MessageFormProps {
  algorithm: string;
  keyValue: string;
}
export function MessageForm({ algorithm, keyValue }: MessageFormProps){
    const [form, Setform] = useState({
        content: "",
        algorithm: "",
        key: ""
    });
    useEffect(() => {
    Setform((prev) => ({
      ...prev,
      algorithm: algorithm,
      key: keyValue
    }));
  }, [algorithm, keyValue]);
    async function sendMessage(e:React.FormEvent){
        e.preventDefault();
        const response = await fetch("/api/message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        })
        if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erreur serveur ${response.status}: ${errorText}`)
      }
      const data = await response.json()
      console.log("Succès:", data)
      Setform({
        content: "",
        algorithm: "",
        key: ""
      })
    }
    return(
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900 to-slate-900/80 border-t border-slate-700/50 backdrop-blur-sm px-6 py-4">
            <form onSubmit={sendMessage}>
            <div className="flex gap-3">
                <input 
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none max-h-24"
                placeholder="Type your message..."
                value={form.content}
                onChange={(e) => Setform({ ...form, content: e.target.value })}
                >
                </input>
                <button 
                className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/50"
                type="submit"
                disabled={!form.content}>
                <Send className="w-4 h-4" />
                </button>
            </div>
            </form>
        </div>
    )
}