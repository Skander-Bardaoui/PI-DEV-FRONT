import { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, MessageCircle, Paperclip, File as FileIcon, Image as ImageIcon, Download, AtSign } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  taskId: string;
  senderId: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  mentions?: string[];
  createdAt: string;
  sender: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

interface TeamMember {
  id: string;
  user_id: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

interface TaskChatProps {
  taskId: string;
  taskTitle: string;
  currentUserId: string;
  onClose: () => void;
  businessId?: string;
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

// Compress image before upload
async function compressImage(file: File, maxSizeMB: number = 1): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        const maxDimension = 1920;
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              } as FilePropertyBag);
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.8,
        );
      };
      img.onerror = () => {
        resolve(file); // If image fails to load, return original file
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      resolve(file); // If reader fails, return original file
    };
    reader.readAsDataURL(file);
  });
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export default function TaskChat({ taskId, taskTitle, currentUserId, onClose, businessId }: TaskChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionPosition, setMentionPosition] = useState(0);
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages and team members
  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch(`${API_BASE}/messages/task/${taskId}`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();

    // Fetch team members if businessId is provided
    if (businessId) {
      async function fetchTeamMembers() {
        try {
          const res = await fetch(`${API_BASE}/businesses/${businessId}/members`, {
            credentials: 'include',
          });
          if (res.ok) {
            const data = await res.json();
            setTeamMembers(Array.isArray(data) ? data : data.members || []);
          }
        } catch (error) {
          console.error('Failed to fetch team members:', error);
        }
      }
      fetchTeamMembers();
    }
  }, [taskId, businessId]);

  // Socket.io connection
  useEffect(() => {
    const newSocket = io(API_BASE, {
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket');
      newSocket.emit('joinTask', taskId);
    });

    newSocket.on('newMessage', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leaveTask', taskId);
      newSocket.disconnect();
    };
  }, [taskId]);

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || sending) return;

    setSending(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('taskId', taskId);
      
      if (newMessage.trim()) {
        formData.append('content', newMessage.trim());
      }

      if (selectedFile) {
        // Compress image if it's an image file
        const fileToUpload = selectedFile.type.startsWith('image/')
          ? await compressImage(selectedFile)
          : selectedFile;
        
        formData.append('file', fileToUpload);
      }

      // Add mentions if any
      if (selectedMentions.length > 0) {
        formData.append('mentions', JSON.stringify(selectedMentions));
      }

      const res = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (res.ok) {
        // Message will be received via socket broadcast
        setNewMessage('');
        setSelectedFile(null);
        setUploadProgress(0);
        setSelectedMentions([]);
        setShowMentions(false);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        alert('File size must be less than 100MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !showMentions) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    setNewMessage(value);

    // Check for @ symbol to trigger mentions
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      // Check if there's no space after @
      if (!textAfterAt.includes(' ')) {
        setMentionSearch(textAfterAt.toLowerCase());
        setMentionPosition(lastAtIndex);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (member: TeamMember) => {
    const memberName = getMemberName(member);
    const beforeMention = newMessage.substring(0, mentionPosition);
    const afterMention = newMessage.substring(textareaRef.current?.selectionStart || newMessage.length);
    const newText = `${beforeMention}@${memberName} ${afterMention}`;
    
    setNewMessage(newText);
    setShowMentions(false);
    setMentionSearch('');
    
    // Add to selected mentions
    if (!selectedMentions.includes(member.user_id)) {
      setSelectedMentions([...selectedMentions, member.user_id]);
    }
    
    // Focus back on textarea
    textareaRef.current?.focus();
  };

  const getMemberName = (member: TeamMember) => {
    if (member.user.firstName || member.user.lastName) {
      return `${member.user.firstName || ''} ${member.user.lastName || ''}`.trim();
    }
    return member.user.email.split('@')[0];
  };

  const filteredMembers = teamMembers.filter((member) => {
    if (!mentionSearch) return true;
    const name = getMemberName(member).toLowerCase();
    const email = member.user.email.toLowerCase();
    return name.includes(mentionSearch) || email.includes(mentionSearch);
  });

  const getSenderName = (sender: Message['sender']) => {
    if (sender.firstName || sender.lastName) {
      return `${sender.firstName || ''} ${sender.lastName || ''}`.trim();
    }
    return sender.email;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessageWithMentions = (content: string, isOwn: boolean) => {
    // Highlight @mentions in the message
    const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
    const parts = content.split(mentionRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is a mention
        return (
          <span
            key={index}
            className={`font-semibold ${isOwn ? 'text-indigo-100' : 'text-indigo-600'}`}
          >
            @{part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Task Chat</h2>
              <p className="text-sm text-gray-500 truncate max-w-md">{taskTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageCircle className="h-12 w-12 mb-3" />
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.senderId === currentUserId;
              const isImage = message.fileType?.startsWith('image/');
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                    {!isOwn && (
                      <p className="text-xs font-medium text-gray-600 mb-1 px-3">
                        {getSenderName(message.sender)}
                      </p>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isOwn
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.content && (
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {renderMessageWithMentions(message.content, isOwn)}
                        </p>
                      )}
                      {message.mentions && message.mentions.length > 0 && (
                        <div className={`flex items-center gap-1 mt-2 text-xs ${isOwn ? 'text-indigo-200' : 'text-gray-500'}`}>
                          <AtSign className="h-3 w-3" />
                          <span>{message.mentions.length} mentioned</span>
                        </div>
                      )}
                      
                      {message.fileUrl && (
                        <div className="mt-2">
                          {isImage ? (
                            <a
                              href={`${API_BASE}${message.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={`${API_BASE}${message.fileUrl}`}
                                alt={message.fileName}
                                className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                style={{ maxHeight: '300px' }}
                              />
                            </a>
                          ) : (
                            <a
                              href={`${API_BASE}${message.fileUrl}`}
                              download={message.fileName}
                              className={`flex items-center gap-2 p-2 rounded-lg ${
                                isOwn
                                  ? 'bg-indigo-700 hover:bg-indigo-800'
                                  : 'bg-gray-200 hover:bg-gray-300'
                              } transition-colors`}
                            >
                              <FileIcon className="h-5 w-5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {message.fileName}
                                </p>
                                {message.fileSize && (
                                  <p className="text-xs opacity-75">
                                    {formatFileSize(message.fileSize)}
                                  </p>
                                )}
                              </div>
                              <Download className="h-4 w-4 flex-shrink-0" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <p
                      className={`text-xs text-gray-400 mt-1 px-3 ${
                        isOwn ? 'text-right' : 'text-left'
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 relative">
          {selectedFile && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
              {selectedFile.type.startsWith('image/') ? (
                <ImageIcon className="h-8 w-8 text-indigo-600" />
              ) : (
                <FileIcon className="h-8 w-8 text-indigo-600" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                onClick={removeSelectedFile}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Mentions dropdown */}
          {showMentions && filteredMembers.length > 0 && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
              <div className="p-2">
                <p className="text-xs font-medium text-gray-500 px-2 py-1">Mention team member</p>
                {filteredMembers.slice(0, 5).map((member) => (
                  <button
                    key={member.id}
                    onClick={() => insertMention(member)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                      {getMemberName(member).substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getMemberName(member)}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {member.user.email}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="*/*"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Attach file"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                const cursorPos = textareaRef.current?.selectionStart || newMessage.length;
                const newText = newMessage.substring(0, cursorPos) + '@' + newMessage.substring(cursorPos);
                setNewMessage(newText);
                setMentionPosition(cursorPos);
                setShowMentions(true);
                textareaRef.current?.focus();
              }}
              disabled={sending}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Mention someone"
            >
              <AtSign className="h-5 w-5" />
            </button>
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleMessageChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message... (use @ to mention)"
              rows={1}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              style={{ minHeight: '42px', maxHeight: '120px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={(!newMessage.trim() && !selectedFile) || sending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {uploadProgress > 0 && (
                    <span className="text-xs">{uploadProgress}%</span>
                  )}
                </>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

