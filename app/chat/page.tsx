"use client";
import { useState, useRef, useEffect, Fragment } from "react";
import { Card, Input, Button, Avatar, Tooltip, Chip, Spinner } from "@heroui/react";
import { ThemeSwitch } from "../../components/theme-switch";
import { HiOutlinePaperClip, HiOutlineMicrophone, HiOutlineEmojiHappy, HiOutlineDotsHorizontal, HiOutlineMenu, HiOutlinePlus, HiOutlineTrash, HiOutlineChatAlt2, HiOutlineDatabase, HiOutlineSparkles, HiOutlineLightningBolt } from "react-icons/hi";
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
}

const initialSessions: ChatSession[] = [
  {
    id: "1",
    name: "Database Overview",
    messages: [
      { role: "ai", content: "Welcome! I'm your SQL Intelligence Assistant. I can help you query your MSSQL database using natural language. Try asking me something like:\n\n- \"Show me all tables in the database\"\n- \"What are the recent orders?\"\n- \"Count users by region\"\n\nWhat would you like to know about your database?", timestamp: Date.now() },
    ],
  },
];

const emojiList = ["👍", "😂", "🎉", "😮", "❤️", "😢"];

type ShowEmojiType = boolean | number | "input";

const LOCAL_STORAGE_KEY = "chat_sessions";
const LOCAL_STORAGE_ACTIVE_KEY = "chat_active_session_id";

function groupMessages(messages: Message[]) {
  const groups: { role: Message["role"]; messages: Message[]; startIdx: number }[] = [];
  let lastRole: Message["role"] | null = null;
  let lastIdx = 0;
  messages.forEach((msg, idx) => {
    if (msg.role !== lastRole) {
      groups.push({ role: msg.role, messages: [msg], startIdx: idx });
      lastRole = msg.role;
      lastIdx = groups.length - 1;
    } else {
      groups[lastIdx].messages.push(msg);
    }
  });
  return groups;
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatTime(date: Date) {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function getDateSeparator(prev: Message | null, curr: Message) {
  if (!prev) return formatDate(new Date(curr.timestamp));
  const prevDate = new Date(prev.timestamp);
  const currDate = new Date(curr.timestamp);
  if (prevDate.toDateString() !== currDate.toDateString()) {
    return formatDate(currDate);
  }
  if (curr.timestamp - prev.timestamp > 1000 * 60 * 60) {
    return formatTime(currDate);
  }
  return null;
}

const suggestedQueries = [
  "Show me all tables in the database",
  "What are the recent orders?",
  "Count users by region",
  "Find top selling products",
  "Show customer demographics",
  "Analyze sales trends"
];

export default function ChatPage() {
  const [chatState, setChatState] = useState<{sessions: ChatSession[], activeSessionId: string}>({ sessions: initialSessions, activeSessionId: initialSessions[0].id });
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState<ShowEmojiType>(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeSession = chatState.sessions.find((s) => s.id === chatState.activeSessionId);
  if (!activeSession) return null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatState.sessions]);

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
      } catch {}
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(chatState.sessions));
  }, [chatState.sessions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ACTIVE_KEY, chatState.activeSessionId);
  }, [chatState.activeSessionId]);

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content) return;
    
    const userMsg: Message = { role: "user", content, timestamp: Date.now() };
    setChatState((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === prev.activeSessionId
          ? { ...s, messages: [...s.messages, userMsg] }
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
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const aiMsg: Message = {
        role: "ai",
        content: data.result || "(No response)",
        timestamp: Date.now(),
      };
      setChatState((prev) => ({
        ...prev,
        sessions: prev.sessions.map((s) =>
          s.id === prev.activeSessionId
            ? { ...s, messages: [...s.messages, aiMsg] }
            : s
        ),
      }));
    } catch (err) {
      setChatState((prev) => ({
        ...prev,
        sessions: prev.sessions.map((s) =>
          s.id === prev.activeSessionId
            ? { ...s, messages: [...s.messages, { role: "ai", content: "Sorry, there was an error connecting to the database. Please check your connection and try again.", timestamp: Date.now() }] }
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
  };

  const deleteSession = (id: string) => {
    if (!window.confirm("Delete this chat session?")) return;
    setChatState((prev) => {
      const filtered = prev.sessions.filter((s) => s.id !== id);
      if (prev.activeSessionId === id && filtered.length > 0) {
        return { ...prev, activeSessionId: filtered[0].id, sessions: filtered };
      } else if (filtered.length === 0) {
        const newSession = {
          id: "1",
          name: "Database Overview",
          messages: [
            { role: "ai" as const, content: "Welcome! I'm your SQL Intelligence Assistant. How can I help you explore your database today?", timestamp: Date.now() },
          ],
        };
        return { ...prev, activeSessionId: newSession.id, sessions: [newSession] };
      }
      return { ...prev, sessions: filtered };
    });
  };

  if (!hydrated) return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/30">
      <div className="text-center">
        <Spinner size="lg" className="mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading your chat sessions...</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex flex-row bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/30 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col h-full w-80 min-w-[20rem] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-white/20 dark:border-gray-800/50 shadow-2xl z-20 overflow-y-auto">
        <div className="flex items-center gap-4 px-6 py-6 border-b border-white/20 dark:border-gray-800/50">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-md opacity-30" />
            <Avatar 
              name="SQL" 
              size="md" 
              className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" 
            />
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">SQL Intelligence</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Database Assistant</p>
          </div>
          <ThemeSwitch />
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
          {chatState.sessions.map((session) => (
            <div
              key={session.id}
              className={`group cursor-pointer transition-all duration-200 px-4 py-4 rounded-xl flex items-center gap-3 ${
                session.id === chatState.activeSessionId 
                  ? "bg-gradient-to-r from-blue-500/90 to-indigo-500/90 text-white shadow-lg scale-[1.02]" 
                  : "bg-white/60 dark:bg-gray-800/60 hover:bg-blue-50/80 dark:hover:bg-blue-900/30 text-gray-900 dark:text-white hover:shadow-md"
              }`}
              onClick={() => setChatState(cs => ({ ...cs, activeSessionId: session.id }))}
            >
              <HiOutlineChatAlt2 className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-sm">{session.name}</p>
                <p className="text-xs opacity-75">{session.messages.length} messages</p>
              </div>
              <Button
                variant="light"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-1 min-w-0 h-6 w-6"
                onClick={e => {
                  e.stopPropagation();
                  deleteSession(session.id);
                }}
              >
                <HiOutlineTrash className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="p-6 border-t border-white/20 dark:border-gray-800/50">
          <Button
            color="primary"
            fullWidth
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            startContent={<HiOutlinePlus className="w-5 h-5" />}
            onClick={() => {
              const newId = (chatState.sessions.length + 1).toString();
              setChatState(cs => ({
                sessions: [
                  ...cs.sessions,
                  {
                    id: newId,
                    name: `Database Query ${newId}`,
                    messages: [
                      { role: "ai" as const, content: `Welcome to your new database session! I'm ready to help you explore your data. What would you like to know?`, timestamp: Date.now() },
                    ],
                  },
                ],
                activeSessionId: newId,
              }));
            }}
          >
            New Chat Session
          </Button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex items-center gap-4 px-6 py-6 border-b border-gray-200 dark:border-gray-800">
              <Avatar name="SQL" size="md" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white" />
              <div className="flex-1">
                <h1 className="font-bold text-xl">SQL Intelligence</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Database Assistant</p>
              </div>
              <Button variant="light" size="sm" onClick={() => setDrawerOpen(false)}>
                ✕
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
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
                  <HiOutlineChatAlt2 className="w-5 h-5" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{session.name}</p>
                    <p className="text-xs opacity-75">{session.messages.length} messages</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-white/20 dark:border-gray-800/50 shadow-lg">
        <Button variant="light" size="sm" onClick={() => setDrawerOpen(true)}>
          <HiOutlineMenu className="w-6 h-6" />
        </Button>
        <div className="flex items-center gap-2">
          <HiOutlineDatabase className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-lg">SQL Chat</span>
        </div>
        <ThemeSwitch />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full pt-16 lg:pt-0">
        {/* Chat header */}
        <div className="hidden lg:flex items-center gap-4 px-8 py-6 border-b border-white/20 dark:border-gray-800/50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-sm">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-sm opacity-30" />
            <Avatar 
              name={activeSession.name} 
              size="lg" 
              className="relative bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg" 
            />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-xl text-gray-900 dark:text-white">{activeSession.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">Database Connected</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Chip size="sm" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              <HiOutlineLightningBolt className="w-3 h-3 mr-1" />
              AI Powered
            </Chip>
            <Button variant="light" size="sm">
              <HiOutlineDotsHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-6">
          {activeSession.messages.length === 1 && (
            <div className="text-center py-12">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-4">
                  <HiOutlineSparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Try these sample queries</h3>
                <p className="text-gray-600 dark:text-gray-400">Click on any suggestion to get started</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
                {suggestedQueries.map((query, index) => (
                  <Button
                    key={index}
                    variant="bordered"
                    className="p-4 h-auto text-left justify-start border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200"
                    onClick={() => sendMessage(query)}
                  >
                    <div className="flex items-start gap-3">
                      <HiOutlineDatabase className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{query}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {(() => {
            const groups = groupMessages(activeSession.messages);
            let prevMsg: Message | null = null;
            return groups.map((group, gIdx) => {
              const separator = getDateSeparator(prevMsg, group.messages[0]);
              const jsx = (
                <Fragment key={group.startIdx}>
                  {separator && (
                    <div className="flex justify-center my-6">
                      <Chip size="sm" className="bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 shadow-sm">
                        {separator}
                      </Chip>
                    </div>
                  )}
                  <div className={`flex ${group.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className="flex flex-col gap-2 max-w-4xl w-full">
                      {group.messages.map((msg, idx) => (
                        <div key={idx} className="flex items-start gap-3 group">
                          {group.role === "ai" && idx === 0 && (
                            <Avatar 
                              name="AI" 
                              size="sm" 
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md flex-shrink-0 mt-1" 
                            />
                          )}
                          {group.role === "ai" && idx > 0 && <div className="w-8" />}
                          
                          <div className="flex-1 min-w-0">
                            <div
                              className={`rounded-2xl px-4 py-3 shadow-sm ${
                                group.role === "user"
                                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white ml-auto max-w-2xl"
                                  : "bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white border border-gray-200/50 dark:border-gray-700/50"
                              }`}
                            >
                              {group.role === "ai" ? (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                              ) : (
                                <p className="text-sm font-medium">{msg.content}</p>
                              )}
                            </div>
                            
                            {/* Reactions */}
                            <div className="flex items-center gap-2 mt-2 ml-1">
                              {msg.reactions &&
                                Object.entries(msg.reactions).map(([emoji, count]) => (
                                  <Chip key={emoji} size="sm" className="bg-white/70 dark:bg-gray-800/70 text-xs">
                                    {emoji} {count}
                                  </Chip>
                                ))}
                              <Button
                                variant="light"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 min-w-0 h-6 w-6"
                                onClick={() => setShowEmoji(showEmoji === group.startIdx + idx ? false : group.startIdx + idx)}
                              >
                                <HiOutlineEmojiHappy className="w-4 h-4" />
                              </Button>
                              {showEmoji === group.startIdx + idx && (
                                <div className="absolute z-30 mt-8 bg-white dark:bg-gray-900 rounded-xl shadow-xl p-2 flex gap-1 border border-gray-200 dark:border-gray-700">
                                  {emojiList.map((emoji) => (
                                    <button
                                      key={emoji}
                                      className="text-lg hover:scale-125 transition-transform p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                      onClick={() => {
                                        addReaction(group.startIdx + idx, emoji);
                                        setShowEmoji(false);
                                      }}
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            {idx === group.messages.length - 1 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-1">
                                {formatTime(new Date(msg.timestamp))}
                              </div>
                            )}
                          </div>
                          
                          {group.role === "user" && idx === group.messages.length - 1 && (
                            <Avatar 
                              name="You" 
                              size="sm" 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md flex-shrink-0 mt-1" 
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Fragment>
              );
              prevMsg = group.messages[group.messages.length - 1];
              return jsx;
            });
          })()}
          
          {typing && (
            <div className="flex items-start gap-3">
              <Avatar name="AI" size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md" />
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl px-4 py-3 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">Analyzing your query...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form
          className="flex items-center gap-3 px-4 lg:px-8 py-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-white/20 dark:border-gray-800/50 shadow-lg"
          onSubmit={async e => {
            e.preventDefault();
            await sendMessage();
          }}
        >
          <Button variant="light" size="lg" className="text-gray-500 hover:text-blue-500 p-2 min-w-0 h-10 w-10">
            <HiOutlinePaperClip className="w-5 h-5" />
          </Button>
          <Button 
            variant="light" 
            size="lg" 
            className="text-gray-500 hover:text-yellow-500 p-2 min-w-0 h-10 w-10" 
            onClick={() => setShowEmoji(showEmoji === "input" ? false : "input")}
          > 
            <HiOutlineEmojiHappy className="w-5 h-5" />
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
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
          <Input
            value={input}
            onValueChange={setInput}
            placeholder="Ask me anything about your database..."
            fullWidth
            className="flex-1"
            classNames={{
              input: "text-sm lg:text-base",
              inputWrapper: "bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow rounded-xl px-4 py-2"
            }}
            disabled={typing}
          />
          <Button variant="light" size="lg" className="text-gray-500 hover:text-blue-500 p-2 min-w-0 h-10 w-10">
            <HiOutlineMicrophone className="w-5 h-5" />
          </Button>
          <Button 
            color="primary" 
            type="submit" 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105" 
            disabled={typing || !input.trim()}
            startContent={!typing && <HiOutlineLightningBolt className="w-4 h-4" />}
          >
            {typing ? <Spinner size="sm" /> : "Send"}
          </Button>
        </form>
      </div>
    </div>
  );
}