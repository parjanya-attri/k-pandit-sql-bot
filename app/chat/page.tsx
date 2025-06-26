"use client";
import { useState, useRef, useEffect, Fragment } from "react";
import { Card, Input, Button, Avatar, Chip, Spinner, Divider } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeSwitch } from "../../components/theme-switch";
import { 
  Paperclip, 
  Mic, 
  Smile, 
  MoreHorizontal, 
  Menu, 
  Plus, 
  Trash2, 
  MessageSquare, 
  Database, 
  Sparkles, 
  Send,
  Bot,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface Message {
  role: "user" | "ai";
  content: string;
  timestamp: number;
  reactions?: { [emoji: string]: number };
}

interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  lastActivity: number;
}

const initialSessions: ChatSession[] = [
  {
    id: "1",
    name: "Database Overview",
    lastActivity: Date.now(),
    messages: [
      { 
        role: "ai", 
        content: "# Welcome to SQL Intelligence! 🚀\n\nI'm your AI-powered database assistant. I can help you:\n\n- **Query your database** using natural language\n- **Analyze data patterns** and generate insights\n- **Create complex reports** with simple requests\n- **Optimize performance** and troubleshoot issues\n\n## Quick Start Examples:\n- \"Show me our top 10 customers by revenue\"\n- \"What are the sales trends for this quarter?\"\n- \"Find products with low inventory levels\"\n\nWhat would you like to explore today?", 
        timestamp: Date.now() 
      },
    ],
  },
];

const emojiList = ["👍", "❤️", "😊", "🎉", "🤔", "👏"];
const LOCAL_STORAGE_KEY = "sql_chat_sessions";
const LOCAL_STORAGE_ACTIVE_KEY = "sql_active_session_id";

const suggestedQueries = [
  "Show me all database tables",
  "What are our top selling products?",
  "Find customers with recent orders",
  "Generate a sales summary report",
  "Show inventory levels by category",
  "Analyze user activity patterns"
];

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}

function formatDate(date: Date) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
}

export default function ChatPage() {
  const [chatState, setChatState] = useState<{sessions: ChatSession[], activeSessionId: string}>({ 
    sessions: initialSessions, 
    activeSessionId: initialSessions[0].id 
  });
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState<boolean | number | "input">(false);
  const [typing, setTyping] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeSession = chatState.sessions.find((s) => s.id === chatState.activeSessionId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatState.sessions, typing]);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const storedActive = localStorage.getItem(LOCAL_STORAGE_ACTIVE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setChatState({
            sessions: parsed,
            activeSessionId: (storedActive && parsed.find((s: ChatSession) => s.id === storedActive)) ? storedActive : parsed[0].id,
          });
        }
      } catch (e) {
        console.error('Failed to parse stored sessions:', e);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(chatState.sessions));
    }
  }, [chatState.sessions, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_KEY, chatState.activeSessionId);
    }
  }, [chatState.activeSessionId, hydrated]);

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content) return;
    
    const userMsg: Message = { role: "user", content, timestamp: Date.now() };
    
    setChatState((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === prev.activeSessionId
          ? { ...s, messages: [...s.messages, userMsg], lastActivity: Date.now() }
          : s
      ),
    }));
    
    setInput("");
    setTyping(true);
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: chatState.activeSessionId,
          message: { role: "user", content: userMsg.content },
        }),
      });
      
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      
      const data = await res.json();
      const aiMsg: Message = {
        role: "ai",
        content: data.result || "I apologize, but I couldn't process your request. Please try again.",
        timestamp: Date.now(),
      };
      
      setChatState((prev) => ({
        ...prev,
        sessions: prev.sessions.map((s) =>
          s.id === prev.activeSessionId
            ? { ...s, messages: [...s.messages, aiMsg], lastActivity: Date.now() }
            : s
        ),
      }));
    } catch (err) {
      console.error('Chat error:', err);
      setChatState((prev) => ({
        ...prev,
        sessions: prev.sessions.map((s) =>
          s.id === prev.activeSessionId
            ? { 
                ...s, 
                messages: [...s.messages, { 
                  role: "ai", 
                  content: "I'm experiencing some technical difficulties. Please check your connection and try again.", 
                  timestamp: Date.now() 
                }],
                lastActivity: Date.now()
              }
            : s
        ),
      }));
    } finally {
      setTyping(false);
    }
  };

  const addReaction = (msgIdx: number, emoji: string) => {
    setChatState((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === prev.activeSessionId
          ? {
              ...s,
              messages: s.messages.map((m, i) =>
                i === msgIdx
                  ? {
                      ...m,
                      reactions: {
                        ...m.reactions,
                        [emoji]: (m.reactions?.[emoji] || 0) + 1,
                      },
                    }
                  : m
              ),
            }
          : s
      ),
    }));
    setShowEmoji(false);
  };

  const createNewSession = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      name: `Chat Session ${chatState.sessions.length + 1}`,
      lastActivity: Date.now(),
      messages: [
        { 
          role: "ai", 
          content: "Hello! I'm ready to help you explore your database. What would you like to know?", 
          timestamp: Date.now() 
        },
      ],
    };
    
    setChatState(prev => ({
      sessions: [newSession, ...prev.sessions],
      activeSessionId: newId,
    }));
    setDrawerOpen(false);
  };

  const deleteSession = (id: string) => {
    if (chatState.sessions.length === 1) return;
    
    setChatState((prev) => {
      const filtered = prev.sessions.filter((s) => s.id !== id);
      const newActiveId = prev.activeSessionId === id ? filtered[0]?.id : prev.activeSessionId;
      return { 
        sessions: filtered, 
        activeSessionId: newActiveId 
      };
    });
  };

  if (!hydrated) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  if (!activeSession) return null;

  return (
    <div className="fixed inset-0 flex bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/30 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col h-full w-80 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50 shadow-xl">
        <div className="flex items-center gap-4 px-6 py-6 border-b border-gray-200/50 dark:border-gray-800/50">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-md opacity-30" />
            <Avatar 
              className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" 
              size="md"
            >
              <Database className="w-5 h-5" />
            </Avatar>
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-xl text-gray-900 dark:text-white">SQL Intelligence</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">AI Database Assistant</p>
          </div>
          <ThemeSwitch />
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Conversations</h2>
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 rounded-lg"
              onClick={createNewSession}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {chatState.sessions
              .sort((a, b) => b.lastActivity - a.lastActivity)
              .map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`group cursor-pointer transition-all duration-200 px-4 py-4 rounded-xl flex items-center gap-3 ${
                  session.id === chatState.activeSessionId 
                    ? "bg-gradient-to-r from-blue-500/90 to-indigo-500/90 text-white shadow-lg" 
                    : "bg-gray-50/80 dark:bg-gray-800/80 hover:bg-blue-50/80 dark:hover:bg-blue-900/30 text-gray-900 dark:text-white hover:shadow-md"
                }`}
                onClick={() => setChatState(cs => ({ ...cs, activeSessionId: session.id }))}
              >
                <MessageSquare className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-sm">{session.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs opacity-75">{session.messages.length} messages</p>
                    <span className="text-xs opacity-50">•</span>
                    <p className="text-xs opacity-75">{formatDate(new Date(session.lastActivity))}</p>
                  </div>
                </div>
                {chatState.sessions.length > 1 && (
                  <Button
                    variant="light"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-1 min-w-0 h-6 w-6"
                    onClick={e => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
            <motion.div 
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl"
            >
              <div className="flex items-center gap-4 px-6 py-6 border-b border-gray-200 dark:border-gray-800">
                <Avatar className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white" size="md">
                  <Database className="w-5 h-5" />
                </Avatar>
                <div className="flex-1">
                  <h1 className="font-bold text-xl">SQL Intelligence</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">AI Assistant</p>
                </div>
                <Button variant="light" size="sm" onClick={() => setDrawerOpen(false)}>
                  ✕
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Conversations</h2>
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white" onClick={createNewSession}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {chatState.sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`cursor-pointer px-4 py-4 rounded-xl flex items-center gap-3 ${
                        session.id === chatState.activeSessionId 
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white" 
                          : "bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                      }`}
                      onClick={() => {
                        setChatState(cs => ({ ...cs, activeSessionId: session.id }));
                        setDrawerOpen(false);
                      }}
                    >
                      <MessageSquare className="w-5 h-5" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{session.name}</p>
                        <p className="text-xs opacity-75">{session.messages.length} messages</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-lg">
        <Button variant="light" size="sm" onClick={() => setDrawerOpen(true)}>
          <Menu className="w-6 h-6" />
        </Button>
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-lg">SQL Chat</span>
        </div>
        <ThemeSwitch />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full pt-16 lg:pt-0">
        {/* Chat header */}
        <div className="hidden lg:flex items-center gap-4 px-8 py-6 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm">
          <Avatar className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg" size="lg">
            <Bot className="w-6 h-6" />
          </Avatar>
          <div className="flex-1">
            <h2 className="font-bold text-xl text-gray-900 dark:text-white">{activeSession.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">AI Assistant Online</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Chip size="sm" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Powered
            </Chip>
            <Button variant="light" size="sm">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
          {activeSession.messages.length === 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-6 shadow-lg">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Try these sample queries</h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg">Click on any suggestion to get started</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {suggestedQueries.map((query, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      variant="bordered"
                      className="p-6 h-auto text-left justify-start border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200 rounded-xl"
                      onClick={() => sendMessage(query)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <Database className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white text-left">{query}</span>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="space-y-6">
            {activeSession.messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-start gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <Avatar 
                  className={`shadow-md flex-shrink-0 ${
                    message.role === "user" 
                      ? "bg-gradient-to-r from-purple-500 to-pink-500" 
                      : "bg-gradient-to-r from-blue-500 to-indigo-500"
                  } text-white`}
                  size="sm"
                >
                  {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </Avatar>
                
                <div className={`flex-1 max-w-4xl ${message.role === "user" ? "flex justify-end" : ""}`}>
                  <div
                    className={`rounded-2xl px-6 py-4 shadow-sm ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white max-w-2xl"
                        : "bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white border border-gray-200/50 dark:border-gray-700/50"
                    }`}
                  >
                    {message.role === "ai" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="font-medium">{message.content}</p>
                    )}
                  </div>
                  
                  {/* Message metadata */}
                  <div className={`flex items-center gap-2 mt-2 px-2 ${message.role === "user" ? "justify-end" : ""}`}>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(new Date(message.timestamp))}
                    </span>
                    {message.role === "ai" && (
                      <>
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                        <span className="text-xs text-emerald-600 dark:text-emerald-400">Delivered</span>
                      </>
                    )}
                    
                    {/* Reactions */}
                    {message.reactions && Object.entries(message.reactions).length > 0 && (
                      <div className="flex items-center gap-1 ml-2">
                        {Object.entries(message.reactions).map(([emoji, count]) => (
                          <Chip key={emoji} size="sm" className="bg-gray-100 dark:bg-gray-700 text-xs">
                            {emoji} {count}
                          </Chip>
                        ))}
                      </div>
                    )}
                    
                    <Button
                      variant="light"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 min-w-0 h-6 w-6"
                      onClick={() => setShowEmoji(showEmoji === index ? false : index)}
                    >
                      <Smile className="w-4 h-4" />
                    </Button>
                    
                    {showEmoji === index && (
                      <div className="absolute z-30 mt-8 bg-white dark:bg-gray-900 rounded-xl shadow-xl p-3 flex gap-2 border border-gray-200 dark:border-gray-700">
                        {emojiList.map((emoji) => (
                          <button
                            key={emoji}
                            className="text-lg hover:scale-125 transition-transform p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={() => addReaction(index, emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {typing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-4"
              >
                <Avatar className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md" size="sm">
                  <Bot className="w-4 h-4" />
                </Avatar>
                <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl px-6 py-4 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">AI is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="px-4 lg:px-8 py-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 shadow-lg">
          <form
            className="flex items-end gap-3 max-w-4xl mx-auto"
            onSubmit={async e => {
              e.preventDefault();
              await sendMessage();
            }}
          >
            <div className="flex items-center gap-2">
              <Button variant="light" size="sm" className="text-gray-500 hover:text-blue-500 p-2 min-w-0 h-10 w-10">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Button 
                variant="light" 
                size="sm" 
                className="text-gray-500 hover:text-yellow-500 p-2 min-w-0 h-10 w-10" 
                onClick={() => setShowEmoji(showEmoji === "input" ? false : "input")}
              > 
                <Smile className="w-5 h-5" />
              </Button>
              {showEmoji === "input" && (
                <div className="absolute bottom-20 left-20 bg-white dark:bg-gray-900 rounded-xl shadow-xl p-3 flex gap-2 border border-gray-200 dark:border-gray-700 z-30">
                  {emojiList.map((emoji) => (
                    <button
                      key={emoji}
                      className="text-lg hover:scale-125 transition-transform p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => {
                        setInput(input + emoji);
                        setShowEmoji(false);
                        inputRef.current?.focus();
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onValueChange={setInput}
                placeholder="Ask me anything about your database..."
                className="w-full"
                classNames={{
                  input: "text-base",
                  inputWrapper: "bg-white/90 dark:bg-gray-800/90 border-2 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow rounded-2xl px-4 py-3 min-h-[3rem]"
                }}
                disabled={typing}
                endContent={
                  <Button 
                    variant="light" 
                    size="sm" 
                    className="text-gray-500 hover:text-blue-500 p-2 min-w-0 h-8 w-8"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                }
              />
            </div>
            
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 min-h-[3rem]" 
              disabled={typing || !input.trim()}
              startContent={typing ? <Spinner size="sm" /> : <Send className="w-4 h-4" />}
            >
              {typing ? "Sending..." : "Send"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}