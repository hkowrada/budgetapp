import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import {
  MessageCircle,
  Send,
  Search,
  Plus,
  Users,
  Settings,
  LogOut,
  Moon,
  Sun,
  Monitor,
  Paperclip,
  Image,
  X,
  Check,
  CheckCheck,
  MoreVertical,
  UserPlus,
  ExternalLink,
  Ghost,
  Eye,
  EyeOff,
  ShieldAlert
} from 'lucide-react';

// Component to detect and render image URLs in messages
const MessageContent = ({ content, isMine }) => {
  // Regex to detect image URLs
  const imageUrlRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|bmp|svg)(?:\?[^\s]*)?)/gi;
  // Regex to detect general URLs
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  
  const parts = [];
  let lastIndex = 0;
  let match;
  
  // Find all image URLs
  const imageMatches = [];
  while ((match = imageUrlRegex.exec(content)) !== null) {
    imageMatches.push({ url: match[0], index: match.index, isImage: true });
  }
  
  // Reset regex
  imageUrlRegex.lastIndex = 0;
  
  // If there are image URLs, render them as images
  if (imageMatches.length > 0) {
    imageMatches.forEach((imgMatch, i) => {
      // Add text before the image
      if (imgMatch.index > lastIndex) {
        const textBefore = content.slice(lastIndex, imgMatch.index);
        if (textBefore.trim()) {
          parts.push(
            <p key={`text-${i}`} className="text-sm whitespace-pre-wrap break-words mb-2">
              {textBefore}
            </p>
          );
        }
      }
      
      // Add the image
      parts.push(
        <div key={`img-${i}`} className="my-2">
          <img
            src={imgMatch.url}
            alt="Shared image"
            className="max-w-full rounded-lg max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(imgMatch.url, '_blank')}
            onError={(e) => {
              // If image fails to load, show as link instead
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <a
            href={imgMatch.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 text-sm underline opacity-80 hover:opacity-100"
          >
            <ExternalLink className="w-3 h-3" />
            {imgMatch.url.length > 40 ? imgMatch.url.substring(0, 40) + '...' : imgMatch.url}
          </a>
        </div>
      );
      
      lastIndex = imgMatch.index + imgMatch.url.length;
    });
    
    // Add remaining text after last image
    if (lastIndex < content.length) {
      const textAfter = content.slice(lastIndex);
      if (textAfter.trim()) {
        parts.push(
          <p key="text-end" className="text-sm whitespace-pre-wrap break-words">
            {textAfter}
          </p>
        );
      }
    }
    
    return <div>{parts}</div>;
  }
  
  // No image URLs, just render text with clickable links
  const textWithLinks = content.split(urlRegex).map((part, i) => {
    if (urlRegex.test(part)) {
      urlRegex.lastIndex = 0;
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline ${isMine ? 'text-primary-foreground/90 hover:text-primary-foreground' : 'text-primary hover:text-primary/80'}`}
        >
          {part.length > 50 ? part.substring(0, 50) + '...' : part}
        </a>
      );
    }
    return part;
  });
  
  return <p className="text-sm whitespace-pre-wrap break-words">{textWithLinks}</p>;
};

export const ChatPage = () => {
  const { user, logout, api } = useAuth();
  const { addMessageHandler, sendTyping, isConnected } = useWebSocket();
  const { theme, setTheme } = useTheme();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogSearchQuery, setDialogSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [deletingMessages, setDeletingMessages] = useState(new Set());
  const [isWindowActive, setIsWindowActive] = useState(true);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef({});

  // Anti-screenshot: Blur content when window loses focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsWindowActive(false);
        document.body.classList.add('window-inactive');
      } else {
        setIsWindowActive(true);
        document.body.classList.remove('window-inactive');
      }
    };

    const handleBlur = () => {
      setIsWindowActive(false);
      document.body.classList.add('window-inactive');
    };

    const handleFocus = () => {
      setIsWindowActive(true);
      document.body.classList.remove('window-inactive');
    };

    // Prevent right-click context menu
    const handleContextMenu = (e) => {
      if (e.target.closest('.protected-content')) {
        e.preventDefault();
        toast.error('📸 Screenshots non autorisés !', { duration: 2000 });
      }
    };

    // Detect print screen attempts
    const handleKeyDown = (e) => {
      if (e.key === 'PrintScreen' || 
          (e.ctrlKey && e.shiftKey && e.key === 'S') ||
          (e.metaKey && e.shiftKey && e.key === '3') ||
          (e.metaKey && e.shiftKey && e.key === '4')) {
        e.preventDefault();
        toast.error('📸 Screenshots non autorisés !', { duration: 2000 });
        document.body.classList.add('window-inactive');
        setTimeout(() => document.body.classList.remove('window-inactive'), 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle responsive view
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const response = await api.get('/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  }, [api]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (conversationId) => {
    try {
      const response = await api.get(`/messages/${conversationId}`);
      setMessages(response.data);
      // Mark messages as read
      await api.post(`/messages/${conversationId}/read`);
      fetchConversations(); // Refresh unread counts
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  }, [api, fetchConversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation, fetchMessages]);

  // Handle WebSocket messages
  useEffect(() => {
    const handleMessage = (message) => {
      if (message.type === 'new_message') {
        const newMsg = message.data;
        
        // Update messages if in the same conversation
        if (selectedConversation?.id === newMsg.conversation_id) {
          setMessages(prev => [...prev, newMsg]);
          // Mark as read
          api.post(`/messages/${newMsg.conversation_id}/read`).catch(console.error);
        }
        
        // Refresh conversations to update last message and unread count
        fetchConversations();
      } else if (message.type === 'typing') {
        const { user_id, conversation_id } = message;
        
        setTypingUsers(prev => ({
          ...prev,
          [conversation_id]: [...(prev[conversation_id] || []).filter(id => id !== user_id), user_id]
        }));

        // Clear typing after 3 seconds
        if (typingTimeoutRef.current[`${conversation_id}-${user_id}`]) {
          clearTimeout(typingTimeoutRef.current[`${conversation_id}-${user_id}`]);
        }
        
        typingTimeoutRef.current[`${conversation_id}-${user_id}`] = setTimeout(() => {
          setTypingUsers(prev => ({
            ...prev,
            [conversation_id]: (prev[conversation_id] || []).filter(id => id !== user_id)
          }));
        }, 3000);
      }
    };

    const unsubscribe = addMessageHandler(handleMessage);
    return unsubscribe;
  }, [addMessageHandler, selectedConversation, api, fetchConversations]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Search users for dialog
  useEffect(() => {
    const searchUsers = async () => {
      if (dialogSearchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await api.get(`/users/search?q=${encodeURIComponent(dialogSearchQuery)}`);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [dialogSearchQuery, api]);

  // Send message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await api.post('/messages', {
        conversation_id: selectedConversation.id,
        content: newMessage.trim(),
        message_type: 'text'
      });

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      fetchConversations();
    } catch (error) {
      toast.error("Échec de l'envoi du message");
    }
  };

  // Handle typing
  const handleTyping = () => {
    if (selectedConversation) {
      sendTyping(selectedConversation.id);
    }
  };

  // Create new conversation
  const handleCreateConversation = async (targetUser) => {
    try {
      const response = await api.post('/conversations', {
        participant_ids: [targetUser.id],
        is_group: false
      });

      setConversations(prev => {
        const exists = prev.find(c => c.id === response.data.id);
        if (exists) return prev;
        return [response.data, ...prev];
      });

      setSelectedConversation(response.data);
      setShowNewChat(false);
      setDialogSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      toast.error('Échec de la création de la conversation');
    }
  };

  // Create group
  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 1) {
      toast.error('Veuillez entrer un nom et sélectionner des participants');
      return;
    }

    try {
      const response = await api.post('/conversations', {
        name: groupName.trim(),
        participant_ids: selectedUsers.map(u => u.id),
        is_group: true
      });

      setConversations(prev => [response.data, ...prev]);
      setSelectedConversation(response.data);
      setShowNewGroup(false);
      setGroupName('');
      setSelectedUsers([]);
      setDialogSearchQuery('');
      setSearchResults([]);
      toast.success('Groupe créé !');
    } catch (error) {
      toast.error('Échec de la création du groupe');
    }
  };

  // File upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const messageType = file.type.startsWith('image/') ? 'image' : 'file';
      
      const response = await api.post('/messages', {
        conversation_id: selectedConversation.id,
        content: file.name,
        message_type: messageType,
        file_url: uploadResponse.data.file_url,
        file_name: file.name
      });

      setMessages(prev => [...prev, response.data]);
      fetchConversations();
      toast.success('Fichier envoyé !');
    } catch (error) {
      toast.error("Échec de l'envoi du fichier");
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Get conversation display info
  const getConversationInfo = (conv) => {
    if (conv.is_group) {
      return {
        name: conv.name,
        avatar: null,
        initials: conv.name?.substring(0, 2).toUpperCase() || 'GR'
      };
    }
    
    const otherUser = conv.participants?.find(p => p.id !== user?.id);
    return {
      name: otherUser?.name || 'Utilisateur',
      avatar: otherUser?.avatar,
      initials: otherUser?.name?.substring(0, 2).toUpperCase() || 'U',
      isOnline: otherUser?.is_online
    };
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'maintenant';
    if (diff < 3600000) return `il y a ${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const showSidebar = !isMobileView || !selectedConversation;
  const showChat = !isMobileView || selectedConversation;

  return (
    <div className="h-screen flex overflow-hidden bg-background" data-testid="chat-page">
      {/* Navigation Rail */}
      <div className="hidden md:flex w-20 h-full flex-col items-center py-6 border-r border-border bg-card/50 glass z-20">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-8">
          <MessageCircle className="w-6 h-6 text-primary" strokeWidth={1.5} />
        </div>

        <div className="flex-1 flex flex-col items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-2xl"
            onClick={() => setShowNewChat(true)}
            data-testid="new-chat-button"
          >
            <Plus className="w-5 h-5" strokeWidth={1.5} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-2xl"
            onClick={() => setShowNewGroup(true)}
            data-testid="new-group-button"
          >
            <Users className="w-5 h-5" strokeWidth={1.5} />
          </Button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl" data-testid="theme-menu-button">
                {theme === 'dark' ? <Moon className="w-5 h-5" strokeWidth={1.5} /> : 
                 theme === 'light' ? <Sun className="w-5 h-5" strokeWidth={1.5} /> :
                 <Monitor className="w-5 h-5" strokeWidth={1.5} />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')} data-testid="theme-light">
                <Sun className="w-4 h-4 mr-2" /> Clair
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')} data-testid="theme-dark">
                <Moon className="w-4 h-4 mr-2" /> Sombre
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')} data-testid="theme-system">
                <Monitor className="w-4 h-4 mr-2" /> Système
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="w-10 h-10 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all" data-testid="user-menu-button">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {user?.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5">
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive" data-testid="logout-button">
                <LogOut className="w-4 h-4 mr-2" /> Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Sidebar - Conversation List */}
      {showSidebar && (
        <div className="w-full md:w-80 lg:w-96 h-full border-r border-border bg-background/50 glass flex flex-col" data-testid="conversation-sidebar">
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
              <div className="flex md:hidden gap-2">
                <Button variant="ghost" size="icon" onClick={() => setShowNewChat(true)}>
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-10 bg-secondary/30 border-transparent rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="search-input"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2">
              {conversations.map((conv) => {
                const info = getConversationInfo(conv);
                const isSelected = selectedConversation?.id === conv.id;
                const isTyping = typingUsers[conv.id]?.length > 0;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-secondary/50 ${
                      isSelected ? 'bg-secondary border-l-4 border-primary' : ''
                    }`}
                    data-testid={`conversation-${conv.id}`}
                  >
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={info.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {info.initials}
                        </AvatarFallback>
                      </Avatar>
                      {info.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background online-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{info.name}</span>
                        {conv.last_message && (
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conv.last_message.created_at)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">
                          {isTyping ? (
                            <span className="text-primary flex items-center gap-1">
                              <span className="typing-dot w-1 h-1 bg-primary rounded-full" />
                              <span className="typing-dot w-1 h-1 bg-primary rounded-full" />
                              <span className="typing-dot w-1 h-1 bg-primary rounded-full" />
                              <span className="ml-1">écrit...</span>
                            </span>
                          ) : conv.last_message?.content || 'Nouvelle conversation'}
                        </p>
                        {conv.unread_count > 0 && (
                          <Badge className="ml-2 bg-primary text-primary-foreground h-5 min-w-5 flex items-center justify-center rounded-full text-xs">
                            {conv.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}

              {conversations.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Aucune conversation</p>
                  <p className="text-sm">Commencez à discuter !</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Chat Area */}
      {showChat && (
        <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden" data-testid="chat-area">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="h-16 px-4 flex items-center justify-between border-b border-border/50 bg-background/50 glass shrink-0">
                <div className="flex items-center gap-3">
                  {isMobileView && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedConversation(null)}
                      data-testid="back-button"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  )}
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={getConversationInfo(selectedConversation).avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getConversationInfo(selectedConversation).initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{getConversationInfo(selectedConversation).name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {getConversationInfo(selectedConversation).isOnline ? (
                        <span className="text-green-500">En ligne</span>
                      ) : selectedConversation.is_group ? (
                        `${selectedConversation.participants?.length || 0} membres`
                      ) : (
                        'Hors ligne'
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isConnected && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Reconnexion...
                    </Badge>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 min-h-0">
                <div className="space-y-4 max-w-full">
                  {messages.map((msg, index) => {
                    const isMine = msg.sender_id === user?.id;
                    const showAvatar = !isMine && (index === 0 || messages[index - 1]?.sender_id !== msg.sender_id);

                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2 message-bubble w-full ${isMine ? 'justify-end' : 'justify-start'}`}
                        data-testid={`message-${msg.id}`}
                      >
                        {!isMine && showAvatar && (
                          <Avatar className="w-8 h-8 shrink-0">
                            <AvatarImage src={msg.sender?.avatar} />
                            <AvatarFallback className="bg-secondary text-xs">
                              {msg.sender?.name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {!isMine && !showAvatar && <div className="w-8 shrink-0" />}
                        
                        <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                          {!isMine && showAvatar && selectedConversation.is_group && (
                            <span className="text-xs text-muted-foreground mb-1 ml-1">{msg.sender?.name}</span>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-2 break-words ${
                              isMine
                                ? 'bg-primary text-primary-foreground rounded-br-sm'
                                : 'bg-secondary text-secondary-foreground rounded-bl-sm'
                            }`}
                          >
                            {msg.message_type === 'image' && msg.file_url && (
                              <img
                                src={`${process.env.REACT_APP_BACKEND_URL}${msg.file_url}`}
                                alt={msg.file_name}
                                className="max-w-full rounded-lg mb-2 max-h-64 object-cover"
                              />
                            )}
                            {msg.message_type === 'file' && msg.file_url && (
                              <a
                                href={`${process.env.REACT_APP_BACKEND_URL}${msg.file_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm underline"
                              >
                                <Paperclip className="w-4 h-4" />
                                {msg.file_name}
                              </a>
                            )}
                            {msg.message_type === 'text' && (
                              <MessageContent content={msg.content} isMine={isMine} />
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1 px-1">
                            <span className="text-[10px] text-muted-foreground mono">
                              {formatTime(msg.created_at)}
                            </span>
                            {isMine && (
                              msg.read_by?.length > 1 ? (
                                <CheckCheck className="w-3 h-3 text-primary" />
                              ) : (
                                <Check className="w-3 h-3 text-muted-foreground" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-border/50 bg-background/50 glass shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile}
                    data-testid="attach-file-button"
                  >
                    {uploadingFile ? (
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Paperclip className="w-5 h-5" strokeWidth={1.5} />
                    )}
                  </Button>
                  <Input
                    placeholder="Écrivez un message..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    className="flex-1 rounded-full bg-secondary/50 border-0 px-6 py-6 focus-visible:ring-1 focus-visible:ring-primary"
                    data-testid="message-input"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="rounded-full w-12 h-12"
                    disabled={!newMessage.trim()}
                    data-testid="send-message-button"
                  >
                    <Send className="w-5 h-5" strokeWidth={1.5} />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <div className="relative">
                <h1 className="text-8xl font-extrabold tracking-tighter text-primary/10 float-animation select-none">
                  SYNC
                </h1>
                <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-medium">
                  Sélectionnez une conversation
                </p>
              </div>
              <Button
                className="mt-8 rounded-full"
                onClick={() => setShowNewChat(true)}
                data-testid="start-chat-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle conversation
              </Button>
            </div>
          )}
        </div>
      )}

      {/* New Chat Dialog */}
      <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
        <DialogContent className="glass-heavy" data-testid="new-chat-dialog">
          <DialogHeader>
            <DialogTitle className="font-bold tracking-tight">Nouvelle conversation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un utilisateur..."
                className="pl-10"
                value={dialogSearchQuery}
                onChange={(e) => setDialogSearchQuery(e.target.value)}
                data-testid="search-user-input"
              />
            </div>
            <ScrollArea className="h-64">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleCreateConversation(u)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-all"
                      data-testid={`user-result-${u.id}`}
                    >
                      <Avatar>
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {u.name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-medium">{u.name}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : dialogSearchQuery.length >= 2 ? (
                <p className="text-center py-8 text-muted-foreground">Aucun utilisateur trouvé</p>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Entrez au moins 2 caractères pour rechercher
                </p>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Group Dialog */}
      <Dialog open={showNewGroup} onOpenChange={setShowNewGroup}>
        <DialogContent className="glass-heavy" data-testid="new-group-dialog">
          <DialogHeader>
            <DialogTitle className="font-bold tracking-tight">Nouveau groupe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom du groupe</Label>
              <Input
                placeholder="Entrez un nom..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="mt-1"
                data-testid="group-name-input"
              />
            </div>

            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((u) => (
                  <Badge key={u.id} variant="secondary" className="flex items-center gap-1">
                    {u.name}
                    <button onClick={() => setSelectedUsers(prev => prev.filter(p => p.id !== u.id))}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Ajouter des participants..."
                className="pl-10"
                value={dialogSearchQuery}
                onChange={(e) => setDialogSearchQuery(e.target.value)}
                data-testid="search-group-members-input"
              />
            </div>

            <ScrollArea className="h-48">
              {searchResults
                .filter(u => !selectedUsers.find(s => s.id === u.id))
                .map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUsers(prev => [...prev, u])}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50"
                    data-testid={`group-user-${u.id}`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {u.name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{u.name}</span>
                    <UserPlus className="w-4 h-4 ml-auto text-muted-foreground" />
                  </button>
                ))}
            </ScrollArea>

            <Button
              onClick={handleCreateGroup}
              className="w-full rounded-full"
              disabled={!groupName.trim() || selectedUsers.length < 1}
              data-testid="create-group-button"
            >
              Créer le groupe
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatPage;
