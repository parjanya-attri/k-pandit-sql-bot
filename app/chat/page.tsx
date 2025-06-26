"use client";
import { useState, useRef, useEffect, Fragment } from "react";
import { Card, Input, Button, Avatar, Tooltip } from "@heroui/react";
import { ThemeSwitch } from "../../components/theme-switch";
import { HiOutlinePaperClip, HiOutlineMicrophone, HiOutlineEmojiHappy, HiOutlineDotsHorizontal, HiOutlineMenu } from "react-icons/hi";
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
    name: "Chat 1",
    messages: [
      { role: "ai", content: "Welcome to Chat 1!", timestamp: Date.now() },
    ],
  },
  {
    id: "2",
    name: "Chat 2",
    messages: [
      { role: "ai", content: "Welcome to Chat 2!", timestamp: Date.now() },
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
  // 1 hour gap
  if (curr.timestamp - prev.timestamp > 1000 * 60 * 60) {
    return formatTime(currDate);
  }
  return null;
}

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

  // Hydrate from localStorage on mount
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

  // Persist sessions to localStorage on change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(chatState.sessions));
  }, [chatState.sessions]);

  // Persist activeSessionId to localStorage on change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ACTIVE_KEY, chatState.activeSessionId);
  }, [chatState.activeSessionId]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input, timestamp: Date.now() };
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
            ? { ...s, messages: [...s.messages, { role: "ai", content: "Sorry, there was an error. Please try again.", timestamp: Date.now() }] }
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

  // Delete a session
  const deleteSession = (id: string) => {
    if (!window.confirm("Delete this chat session?")) return;
    setChatState((prev) => {
      const filtered = prev.sessions.filter((s) => s.id !== id);
      // If the active session is deleted, switch to the first remaining session
      if (prev.activeSessionId === id && filtered.length > 0) {
        return { ...prev, activeSessionId: filtered[0].id };
      } else if (filtered.length === 0) {
        // If no sessions left, create a new one
        const newSession = {
          id: "1",
          name: "Chat 1",
          messages: [
            { role: "ai" as const, content: "Welcome to Chat 1!", timestamp: Date.now() },
          ],
        };
        return { ...prev, activeSessionId: newSession.id, sessions: [newSession] };
      }
      return { ...prev, sessions: filtered };
    });
  };

  if (!hydrated) return null;

  return (
    <div className="fixed inset-0 flex flex-row bg-gradient-to-br from-blue-100/60 via-white/80 to-indigo-100/60 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950 overflow-hidden">
      {/* Sidebar (chat history) for desktop/tablet */}
      <aside className="hidden sm:flex flex-col h-full w-72 min-w-[16rem] max-w-[20vw] bg-white/60 dark:bg-gray-900/60 border-r border-white/30 dark:border-gray-800/60 shadow-2xl z-20 overflow-y-auto">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/30 dark:border-gray-800/60 bg-transparent">
          <Avatar name="Nexa" size="md" className="shadow-lg" />
          <span className="font-extrabold text-2xl tracking-tight text-gray-900 dark:text-white">Chats</span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeSwitch />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-blue-900">
          {chatState.sessions.map((session) => {
            return (
              <div
                key={session.id}
                className={`cursor-pointer transition-all border-none shadow-none px-4 py-3 rounded-2xl flex items-center gap-3 ${session.id === chatState.activeSessionId ? "bg-gradient-to-r from-blue-500/90 to-indigo-500/90 text-white scale-[1.03] shadow-xl" : "bg-white/80 dark:bg-gray-800/80 hover:bg-blue-100/80 dark:hover:bg-blue-900/40 text-gray-900 dark:text-white"}`}
                onClick={() => {
                  setChatState(cs => ({ ...cs, activeSessionId: session.id }));
                }}
              >
                <Avatar name={session.name} size="sm" className="shadow" />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold truncate block text-sm">{session.name}</span>
                  <span className="text-xs opacity-70">{session.messages.length} messages</span>
                </div>
                <Button
                  variant="light"
                  size="sm"
                  className="ml-2 text-xs text-red-500 hover:text-red-700 px-2 py-1"
                  onClick={e => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  aria-label="Delete chat"
                >
                  Delete
                </Button>
              </div>
            );
          })}
        </div>
        <div className="p-5 border-t border-white/30 dark:border-gray-800/60 bg-transparent">
          <Button
            color="primary"
            fullWidth
            className="rounded-full font-bold shadow-xl py-3 text-lg transition-transform active:scale-95"
            onClick={() => {
              const newId = (chatState.sessions.length + 1).toString();
              setChatState(cs => ({
                sessions: [
                  ...cs.sessions,
                  {
                    id: newId,
                    name: `Chat ${newId}`,
                    messages: [
                      { role: "ai" as const, content: `Welcome to Chat ${newId}!`, timestamp: Date.now() },
                    ],
                  },
                ],
                activeSessionId: newId,
              }));
            }}
          >
            + New Chat
          </Button>
        </div>
      </aside>
      {/* Mobile topbar and drawer */}
      <div className="sm:hidden fixed top-0 left-0 w-full z-30 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-900/80 border-b border-white/30 dark:border-gray-800/60 shadow-lg backdrop-blur-xl">
        <Button variant="ghost" size="sm" className="p-2 min-w-0 h-8 w-8 flex items-center justify-center" onClick={() => setDrawerOpen(true)}>
          <HiOutlineMenu className="w-6 h-6" />
        </Button>
        <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">Chats</span>
        <ThemeSwitch />
      </div>
      {/* Drawer overlay for mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="w-64 bg-white dark:bg-gray-900 h-full flex flex-col shadow-2xl animate-in fade-in">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-white/30 dark:border-gray-800/60 bg-transparent">
              <Avatar name="Nexa" size="md" className="shadow-lg" />
              <span className="font-extrabold text-2xl tracking-tight text-gray-900 dark:text-white">Chats</span>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" size="sm" className="p-2 min-w-0 h-8 w-8 flex items-center justify-center" onClick={() => setDrawerOpen(false)}>
                  ✕
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-blue-900">
              {chatState.sessions.map((session) => {
                return (
                  <div
                    key={session.id}
                    className={`cursor-pointer transition-all border-none shadow-none px-4 py-3 rounded-2xl flex items-center gap-3 ${session.id === chatState.activeSessionId ? "bg-gradient-to-r from-blue-500/90 to-indigo-500/90 text-white scale-[1.03] shadow-xl" : "bg-white/80 dark:bg-gray-800/80 hover:bg-blue-100/80 dark:hover:bg-blue-900/40 text-gray-900 dark:text-white"}`}
                    onClick={() => {
                      setChatState(cs => ({ ...cs, activeSessionId: session.id }));
                      setDrawerOpen(false);
                    }}
                  >
                    <Avatar name={session.name} size="sm" className="shadow" />
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold truncate block text-sm">{session.name}</span>
                      <span className="text-xs opacity-70">{session.messages.length} messages</span>
                    </div>
                    <Button
                      variant="light"
                      size="sm"
                      className="ml-2 text-xs text-red-500 hover:text-red-700 px-2 py-1"
                      onClick={e => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      aria-label="Delete chat"
                    >
                      Delete
                    </Button>
                  </div>
                );
              })}
            </div>
            <div className="p-5 border-t border-white/30 dark:border-gray-800/60 bg-transparent">
              <Button
                color="primary"
                fullWidth
                className="rounded-full font-bold shadow-xl py-3 text-lg transition-transform active:scale-95"
                onClick={() => {
                  const newId = (chatState.sessions.length + 1).toString();
                  setChatState(cs => ({
                    sessions: [
                      ...cs.sessions,
                      {
                        id: newId,
                        name: `Chat ${newId}`,
                        messages: [
                          { role: "ai" as const, content: `Welcome to Chat ${newId}!`, timestamp: Date.now() },
                        ],
                      },
                    ],
                    activeSessionId: newId,
                  }));
                  setDrawerOpen(false);
                }}
              >
                + New Chat
              </Button>
            </div>
          </div>
          <div className="flex-1 bg-black/30" onClick={() => setDrawerOpen(false)} />
        </div>
      )}
      {/* Main chat area */}
      <div className="flex-1 min-w-0 flex flex-col h-full max-w-full overflow-x-hidden">
        {/* Chat header */}
        <div className="flex items-center gap-2 sm:gap-4 px-2 sm:px-4 md:px-10 py-3 sm:py-4 md:py-6 border-b border-white/30 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/70 shadow-lg sticky top-0 z-10 backdrop-blur-xl w-full">
          <Avatar name={activeSession.name} size="md" className="bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-xl w-10 h-10 sm:w-14 sm:h-14" />
          <div>
            <span className="font-bold text-base sm:text-lg tracking-tight text-gray-900 dark:text-white">{activeSession.name}</span>
            <div className="text-xs text-blue-600 dark:text-blue-300 font-medium mt-1">Online</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Tooltip content="More options">
              <Button aria-label="More options" variant="ghost" size="sm" className="p-2 min-w-0 h-8 w-8 flex items-center justify-center">
                <HiOutlineDotsHorizontal className="w-5 h-5" />
              </Button>
            </Tooltip>
          </div>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-1 sm:px-2 md:px-4 lg:px-8 py-2 sm:py-4 md:py-8 space-y-2 md:space-y-5 bg-transparent transition-colors scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-blue-900 w-full max-w-full">
          {chatState.sessions.length === 0 && (
            <div className="text-center text-gray-400">Start the conversation...</div>
          )}
          {(() => {
            const groups = groupMessages(activeSession.messages);
            let prevMsg: Message | null = null;
            return groups.map((group, gIdx) => {
              const separator = getDateSeparator(prevMsg, group.messages[0]);
              const jsx = (
                <Fragment key={group.startIdx}>
                  {separator && (
                    <div className="flex justify-center my-2">
                      <span className="px-2 sm:px-3 py-1 rounded-full bg-white/80 dark:bg-gray-800/80 text-xs text-gray-500 shadow animate-fade-in">
                        {separator}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${group.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                    <div className="flex flex-col gap-1 max-w-full">
                      {group.messages.map((msg, idx) => (
                        <div key={idx} className="flex items-end gap-1 sm:gap-2 max-w-full">
                          {/* Only show avatar for first in group */}
                          {group.role === "ai" && idx === 0 && (
                            <Avatar name="AI" size="sm" className="mr-1 sm:mr-2 bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow" />
                          )}
                          <div className={`relative max-w-[90vw] sm:max-w-xl w-fit`}>
                            <div
                              className={`rounded-2xl sm:rounded-3xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-sm sm:text-base font-normal break-words shadow-xl transition-all duration-200 ${
                                group.role === "user"
                                  ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-br-lg"
                                  : "bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white rounded-bl-lg"
                              }`}
                            >
                              {group.role === "ai" ? (
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                              ) : (
                                msg.content
                              )}
                            </div>
                            {/* Reactions */}
                            <div className="flex gap-1 mt-1 ml-1">
                              {msg.reactions &&
                                Object.entries(msg.reactions).map(([emoji, count]) => (
                                  <span key={emoji} className="text-lg px-1 rounded-full bg-white/70 dark:bg-gray-900/70 shadow border border-gray-200 dark:border-gray-800 cursor-pointer hover:scale-110 transition-transform">
                                    {emoji} {count}
                                  </span>
                                ))}
                              <Tooltip content="Add reaction">
                                <button
                                  type="button"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-blue-500 text-lg px-1"
                                  onClick={() => setShowEmoji(showEmoji === group.startIdx + idx ? false : group.startIdx + idx)}
                                  tabIndex={0}
                                >
                                  <HiOutlineEmojiHappy />
                                </button>
                              </Tooltip>
                              {showEmoji === group.startIdx + idx && (
                                <div className="absolute z-30 mt-2 left-0 bg-white dark:bg-gray-900 rounded-xl shadow-xl p-2 flex gap-1 animate-in fade-in">
                                  {emojiList.map((emoji) => (
                                    <button
                                      key={emoji}
                                      className="text-xl hover:scale-125 transition-transform"
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
                            {/* Timestamp for last in group */}
                            {idx === group.messages.length - 1 && (
                              <div className="text-xs text-gray-400 mt-1 ml-2 select-none">
                                {formatTime(new Date(msg.timestamp))}
                              </div>
                            )}
                          </div>
                          {group.role === "user" && idx === group.messages.length - 1 && (
                            <Avatar name="You" size="sm" className="ml-1 sm:ml-2 bg-gradient-to-br from-pink-400 to-pink-600 text-white shadow" />
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
          {/* Typing indicator */}
          {typing && (
            <div className="flex items-end gap-2 justify-start animate-pulse">
              <Avatar name="AI" size="sm" className="mr-2 bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow" />
              <div className="rounded-3xl px-6 py-4 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white shadow-xl flex gap-1 items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input area */}
        <form
          className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 md:px-10 py-2 sm:py-4 md:py-6 bg-white/80 dark:bg-gray-900/80 shadow-2xl rounded-t-2xl sm:rounded-t-3xl sticky bottom-0 z-10 backdrop-blur-xl w-full"
          onSubmit={async e => {
            e.preventDefault();
            await sendMessage();
          }}
        >
          <Button aria-label="Attach file" variant="ghost" size="lg" className="text-gray-500 hover:text-blue-500 p-2 min-w-0 h-10 w-10 flex items-center justify-center">
            <HiOutlinePaperClip className="w-6 h-6" />
          </Button>
          <Button aria-label="Emoji picker" variant="ghost" size="lg" className="text-gray-500 hover:text-yellow-500 p-2 min-w-0 h-10 w-10 flex items-center justify-center" onClick={() => setShowEmoji(showEmoji === "input" ? false : "input")}> 
            <HiOutlineEmojiHappy className="w-6 h-6" />
          </Button>
          {showEmoji === "input" && (
            <div className="absolute bottom-20 left-10 sm:left-32 bg-white dark:bg-gray-900 rounded-xl shadow-xl p-2 flex gap-1 animate-in fade-in z-30">
              {emojiList.map((emoji) => (
                <button
                  key={emoji}
                  className="text-xl hover:scale-125 transition-transform"
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
            placeholder="Type your message..."
            fullWidth
            className="rounded-full px-3 sm:px-5 py-2 sm:py-3 text-sm sm:text-base shadow-lg bg-white/90 dark:bg-gray-800/90 border-none focus:ring-2 focus:ring-blue-400 transition-all"
            aria-label="Type your message"
            disabled={typing}
          />
          <Button aria-label="Voice input" variant="ghost" size="lg" className="text-gray-500 hover:text-blue-500 p-2 min-w-0 h-10 w-10 flex items-center justify-center">
            <HiOutlineMicrophone className="w-6 h-6" />
          </Button>
          <Button color="primary" type="submit" className="rounded-full px-6 sm:px-8 py-2 sm:py-3 font-bold text-base sm:text-lg shadow-xl transition-transform active:scale-95" disabled={typing}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
} 