import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Circle, Check, CheckCheck, ArrowLeft, Paperclip, MessageSquare, Mail, Users } from "lucide-react";

export default function Chat() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [adminOnline, setAdminOnline] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userFilter, setUserFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const { data: adminUsers = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      try {
        const users = await base44.entities.User.list();
        return users.filter(u => u.role === 'admin');
      } catch (error) {
        return [];
      }
    },
    refetchInterval: 30000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
    enabled: user?.role === 'admin',
    refetchInterval: 10000,
    placeholderData: [],
  });

  useEffect(() => {
    const isOnline = adminUsers.some(admin => admin.is_online);
    setAdminOnline(isOnline);
  }, [adminUsers]);

  const { data: allMessages = [] } = useQuery({
    queryKey: ['all-messages'],
    queryFn: () => base44.entities.ChatMessage.list('-created_date'),
    refetchInterval: 2000,
    placeholderData: [],
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-messages-count'],
    queryFn: async () => {
      if (user?.role !== 'admin') return 0;
      const messages = await base44.entities.ChatMessage.list();
      return messages.filter(msg => msg.sender_role !== 'admin' && !msg.read).length;
    },
    enabled: user?.role === 'admin',
    refetchInterval: 2000,
    initialData: 0,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages', user?.id, selectedUserId],
    queryFn: async () => {
      const allMsgs = await base44.entities.ChatMessage.list('-created_date');
      
      if (user?.role === 'admin') {
        const unreadMessages = allMsgs.filter(msg => 
          msg.sender_role !== 'admin' && 
          !msg.read && 
          (!selectedUserId || msg.sender_id === selectedUserId)
        );
        
        if (unreadMessages.length > 0 && selectedUserId) {
          await Promise.all(unreadMessages.map(msg => 
            base44.entities.ChatMessage.update(msg.id, { read: true })
          ));
          queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
          queryClient.invalidateQueries({ queryKey: ['all-messages'] });
        }

        if (selectedUserId) {
          return allMsgs.filter(msg => 
            msg.sender_id === selectedUserId || 
            (msg.sender_role === 'admin' && msg.recipient_id === selectedUserId)
          ).reverse();
        }
        return [];
      } else {
        return allMsgs.filter(msg => 
          msg.sender_id === user?.id || 
          (msg.sender_role === 'admin' && (msg.recipient_id === user?.id || !msg.recipient_id))
        ).reverse();
      }
    },
    refetchInterval: 2000,
    enabled: !!user,
    placeholderData: [],
  });

  const sendMessageMutation = useMutation({
    mutationFn: (messageData) => base44.entities.ChatMessage.create(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
      queryClient.invalidateQueries({ queryKey: ['all-messages'] });
      setMessage("");
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
  });

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!message.trim() || !user) return;

    const messageData = {
      sender_id: user.id,
      sender_name: user.full_name || user.email,
      sender_role: user.role || 'user',
      message: message.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };

    if (user.role === 'admin' && selectedUserId) {
      messageData.recipient_id = selectedUserId;
    }

    sendMessageMutation.mutate(messageData);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const messageData = {
        sender_id: user.id,
        sender_name: user.full_name || user.email,
        sender_role: user.role || 'user',
        message: `📎 ${file.name}`,
        file_url: file_url,
        timestamp: new Date().toISOString(),
        read: false
      };

      if (user.role === 'admin' && selectedUserId) {
        messageData.recipient_id = selectedUserId;
      }

      sendMessageMutation.mutate(messageData);
    } catch (error) {
      alert("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const selectedUser = selectedUserId ? users.find(u => u.id === selectedUserId) : null;

  const getFilteredUsers = () => {
    let filtered = [...new Map(
      allMessages
        .filter(msg => msg.sender_role !== 'admin')
        .map(msg => {
          const chatUser = users.find(u => u.id === msg.sender_id);
          return chatUser ? [chatUser.id, chatUser] : null;
        })
        .filter(Boolean)
    ).values()];
    
    if (userFilter === 'all') return filtered;
    
    const now = new Date();
    let cutoffDate = new Date();
    
    if (userFilter === 'today') {
      cutoffDate.setHours(0, 0, 0, 0);
    } else if (userFilter === 'yesterday') {
      cutoffDate.setDate(cutoffDate.getDate() - 1);
      cutoffDate.setHours(0, 0, 0, 0);
      const endOfYesterday = new Date(cutoffDate);
      endOfYesterday.setHours(23, 59, 59, 999);
      return filtered.filter(u => {
        const createdDate = new Date(u.created_date);
        return createdDate >= cutoffDate && createdDate <= endOfYesterday;
      });
    } else if (userFilter === 'last2days') {
      cutoffDate.setDate(cutoffDate.getDate() - 2);
    } else if (userFilter === 'last7days') {
      cutoffDate.setDate(cutoffDate.getDate() - 7);
    }
    
    return filtered.filter(u => new Date(u.created_date) >= cutoffDate);
  };
  
  const usersWhoHaveChatted = user?.role === 'admin' ? getFilteredUsers() : [];

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getUnreadCountForUser = (userId) => {
    return allMessages.filter(msg => 
      msg.sender_id === userId && 
      !msg.read && 
      msg.sender_role !== 'admin'
    ).length;
  };

  const getLastMessageForUser = (userId) => {
    const userMessages = allMessages.filter(msg => 
      msg.sender_id === userId || (msg.sender_role === 'admin' && msg.recipient_id === userId)
    );
    return userMessages[0];
  };

  const getTotalMessagesForUser = (userId) => {
    return allMessages.filter(msg => msg.sender_id === userId && msg.sender_role !== 'admin').length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4 md:p-8 pb-24">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-4 rounded-t-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user?.role === 'admin' && selectedUserId && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/20"
                  onClick={() => setSelectedUserId(null)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              
              {user?.role === 'admin' ? (
                selectedUser ? (
                  <div className="flex items-center gap-3">
                    {selectedUser.profile_picture ? (
                      <img 
                        src={selectedUser.profile_picture} 
                        alt={selectedUser.full_name} 
                        className="w-10 h-10 rounded-full border-2 border-white object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                        {selectedUser.full_name?.[0] || selectedUser.email?.[0] || "U"}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{selectedUser.full_name || selectedUser.email}</p>
                      <p className="text-xs opacity-90 flex items-center gap-1">
                        <Circle className={`w-2 h-2 ${selectedUser.is_online ? 'fill-green-400 text-green-400' : 'fill-gray-400 text-gray-400'}`} />
                        {selectedUser.is_online ? "Online" : `Last seen ${formatTime(selectedUser.last_active)}`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Mail className="w-8 h-8" />
                    <div>
                      <p className="font-bold text-lg">Admin Chat Panel</p>
                      <p className="text-xs opacity-90">Manage user conversations</p>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                    A
                  </div>
                  <div>
                    <p className="font-semibold">Admin Support</p>
                    <p className="text-xs opacity-90 flex items-center gap-1">
                      <Circle className={`w-2 h-2 ${adminOnline ? 'fill-green-400 text-green-400' : 'fill-gray-400 text-gray-400'}`} />
                      {adminOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {user?.role === 'admin' && !selectedUserId && (
                <Badge variant="destructive" className="animate-pulse font-bold">
                  {unreadCount} New {unreadCount === 1 ? 'Message' : 'Messages'}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {user?.role === 'admin' && !selectedUserId ? (
          <div className="bg-white rounded-b-xl">
            <Card className="rounded-none border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Users ({usersWhoHaveChatted.length})
                </CardTitle>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-full mt-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="last2days">Last 2 Days</SelectItem>
                    <SelectItem value="last7days">Last 7 Days</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
            </Card>
            
            <div className="min-h-[600px] max-h-[600px] overflow-y-auto">
              {usersWhoHaveChatted.length > 0 ? (
                <div>
                  {usersWhoHaveChatted.map((chatUser) => {
                    const lastMessage = getLastMessageForUser(chatUser.id);
                    const unreadCountUser = getUnreadCountForUser(chatUser.id);
                    const totalMessages = getTotalMessagesForUser(chatUser.id);
                    const isUnread = unreadCountUser > 0;
                    
                    return (
                      <div
                        key={chatUser.id}
                        onClick={() => setSelectedUserId(chatUser.id)}
                        className={`flex items-center gap-3 p-4 border-b hover:bg-teal-50 cursor-pointer transition-all ${isUnread ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                      >
                        <div className="relative flex-shrink-0">
                          {chatUser.profile_picture ? (
                            <img 
                              src={chatUser.profile_picture} 
                              alt={chatUser.full_name} 
                              className="w-14 h-14 rounded-full border-2 border-teal-300 object-cover"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                              {chatUser.full_name?.[0] || chatUser.email?.[0] || "U"}
                            </div>
                          )}
                          {chatUser.is_online && (
                            <Circle className="absolute bottom-0 right-0 w-4 h-4 fill-green-500 text-green-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className={`font-semibold text-gray-900 truncate ${isUnread ? 'text-blue-700' : ''}`}>
                              {chatUser.full_name || chatUser.email}
                            </p>
                            {lastMessage && (
                              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                {formatTime(lastMessage.timestamp)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm truncate flex-1 ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                              {lastMessage ? (
                                <>
                                  {lastMessage.file_url && '📎 '}
                                  {lastMessage.message}
                                </>
                              ) : 'No messages yet'}
                            </p>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge variant="outline" className="text-xs bg-slate-100">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                {totalMessages}
                              </Badge>
                              {isUnread && (
                                <Badge variant="destructive" className="text-xs font-bold animate-pulse">
                                  {unreadCountUser} New
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500 p-8">
                    <Mail className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                    <p className="text-xl font-semibold mb-2">No Conversations Yet</p>
                    <p className="text-sm">Users will appear here when they send a message</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="bg-[#e5ddd5] min-h-[600px] max-h-[600px] overflow-y-auto p-6 space-y-3">
              {user?.role === 'admin' && !selectedUserId ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <p className="text-lg font-semibold mb-2">Select a user to start chatting</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <p className="text-lg font-semibold mb-2">No messages yet</p>
                    <p className="text-sm">Start a conversation!</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isCurrentUser = msg.sender_id === user?.id;
                  const showDate = index === 0 || 
                    new Date(messages[index - 1].timestamp).toDateString() !== new Date(msg.timestamp).toDateString();
                  const msgSender = users.find(u => u.id === msg.sender_id);

                  return (
                    <React.Fragment key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <div className="bg-white/80 px-4 py-1 rounded-full shadow-sm text-xs text-gray-600 font-medium">
                            {new Date(msg.timestamp).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                      )}
                      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                        {!isCurrentUser && msgSender && (
                          msgSender.profile_picture ? (
                            <img 
                              src={msgSender.profile_picture} 
                              alt={msgSender.full_name} 
                              className="w-8 h-8 rounded-full border border-gray-300 object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {msgSender.full_name?.[0] || msgSender.email?.[0] || "U"}
                            </div>
                          )
                        )}
                        <div className={`max-w-[70%] ${
                          isCurrentUser 
                            ? 'bg-[#dcf8c6]' 
                            : 'bg-white'
                        } rounded-lg p-3 shadow-sm`}>
                          {!isCurrentUser && user?.role === 'admin' && (
                            <p className="text-xs font-semibold text-teal-600 mb-1">
                              {msg.sender_name}
                            </p>
                          )}
                          <p className="text-sm text-gray-800 break-words">{msg.message}</p>
                          {msg.file_url && (
                            <a 
                              href={msg.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-2"
                            >
                              <Paperclip className="w-3 h-3" />
                              View File
                            </a>
                          )}
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-[10px] text-gray-500">
                              {formatTime(msg.timestamp)}
                            </span>
                            {isCurrentUser && (
                              msg.read ? 
                                <CheckCheck className="w-4 h-4 text-blue-500" /> : 
                                <Check className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-white p-3 rounded-b-xl shadow-lg">
              <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || (user?.role === 'admin' && !selectedUserId)}
                >
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Paperclip className="w-5 h-5" />
                  )}
                </Button>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border-none bg-gray-100 focus:bg-gray-200 rounded-full px-4"
                  disabled={user?.role === 'admin' && !selectedUserId}
                />
                <Button 
                  type="submit"
                  size="icon"
                  disabled={!message.trim() || (user?.role === 'admin' && !selectedUserId)}
                  className="rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
