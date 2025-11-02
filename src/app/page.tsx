"use client";

import { useState } from "react";
import { MessageForm } from "./components/message-form";
import { MessageList } from "./components/message-list";
import { PopupSettings } from "./components/settings";
import { AuthModal } from "./components/auth-modal";
import { MessageManager } from "./components/attacker";
import { Users, Settings } from "lucide-react"
import { HorseCaptcha } from "./components/captcha";


export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [algorithmSettings, setAlgorithmSettings] = useState({
    algorithm: "",
    key: ""
  });
  const [captchaPassed, setCaptchaPassed] = useState(false);

  if (!captchaPassed)
    return (
      <HorseCaptcha
        imageUrl="\pinguin.png"
        onSuccess={() => setCaptchaPassed(true)}
      />
    );
  if (!isAuthenticated) {
    return <AuthModal onAuthenticate={(user) => {
          setUsername(user);
          setIsAuthenticated(true);
        }} />
  }
if(username === "marwa") return <MessageManager />

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <header className="bg-slate-950/50 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Houthi PC small group</h1>
        </div>
            <button 
            onClick = {() => setShowSettings(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-cyan-500/50">
            <Settings className="w-5 h-5 text-white"/>
            </button>
            
      </header>
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <MessageList />
      </main>
      <div className="border-t border-slate-700/50 bg-slate-900/70 backdrop-blur-sm p-4 sticky bottom-0">
      <MessageForm 
          algorithm={algorithmSettings.algorithm}
          keyValue={algorithmSettings.key}
          />
      </div>
      <PopupSettings
              show={showSettings}
              onClose={() => setShowSettings(false)}
              onSave={(values) => setAlgorithmSettings(values)}
            />
    </div>
  );
}
