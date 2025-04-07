// src/pages/admin/MessageManagement.jsx
import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  List,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  CircularProgress,
  InputAdornment,
  useTheme,
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import io from 'socket.io-client';
import axiosInstance from 'src/utils/axios';

// Placeholder avatar
const USER_AVATAR = '/static/user-avatar.png';
const ADMIN_AVATAR = '/static/admin-avatar.png';

export default function MessageManagement() {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Kết nối socket khi component mount
  useEffect(() => {
    const socketInstance = io("http://localhost:1337");
    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  // Lắng nghe tin nhắn mới từ server
  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", (data) => {
      // Nếu là tin nhắn của người dùng hiện tại
      if (selectedUser && data.user == selectedUser.user_id) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          user_id: data.user,
          message: data.message,
          flag: data.flag,
          createdAt: new Date().toISOString()
        }]);
      }
    });

    return () => {
      socket.off("newMessage");
    };
  }, [socket, selectedUser]);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Lấy danh sách người dùng khi component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Lọc danh sách người dùng khi có search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(user => 
        user.user_id?.toString().includes(searchQuery) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  // Lấy tin nhắn khi chọn người dùng
  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.user_id);
    }
  }, [selectedUser]);

  // Lấy danh sách người dùng từ server - sử dụng filters[group]=true
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Gọi API để lấy danh sách người dùng có tin nhắn
      const response = await axiosInstance.get('/messages?filters[group]=true');
      
      if (response.data && response.data) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Lấy tin nhắn của người dùng
  const fetchMessages = async (userId) => {
    try {
      setLoadingMessages(true);
      
      // Gọi API để lấy tin nhắn của người dùng
      const response = await axiosInstance.get(`/messages?filters[user_id]=${userId}`);
      
      if (response.data && response.data) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Gửi tin nhắn trả lời
  const sendReply = async () => {
    if (!replyText.trim() || !selectedUser) return;
    
    const messageData = {
      data: {
        user_id: selectedUser.user_id,
        message: replyText,
        flag: true // true nghĩa là tin nhắn của admin
      }
    };
    
    try {
      // Gửi tin nhắn qua API
      const response = await axiosInstance.post('/messages', messageData);
      
      // Nếu gửi thành công, cập nhật danh sách tin nhắn
      if (response.data) {
        // Tin nhắn sẽ được cập nhật thông qua socket.io
      }
      
      // Reset input
      setReplyText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Format thời gian hiển thị
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 0, mb: 0 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Quản lý Tin nhắn
      </Typography>
      
      <Paper elevation={3} sx={{ mt: 3, height: 'calc(100vh - 160px)', overflow: 'hidden', borderRadius: 2 }}>
        <Grid container sx={{ height: '100%' }}>
          {/* Danh sách người dùng */}
          <Grid item xs={12} md={4} lg={3} sx={{ borderRight: `1px solid ${theme.palette.divider}`, height: '100%' }}>
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm người dùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
            </Box>
            
            <List sx={{ height: 'calc(100% - 70px)', overflow: 'auto' }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <ListItemButton
                    key={user.user_id}
                    selected={selectedUser?.user_id === user.user_id}
                    onClick={() => setSelectedUser(user)}
                    divider
                  >
                    <ListItemAvatar>
                      <Avatar 
                        alt={user.username || `User ${user.user_id}`} 
                        src={USER_AVATAR}
                      >
                        {user.username ? user.username.charAt(0).toUpperCase() : user.user_id}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.username || `User ID: ${user.user_id}`}
                      secondary={
                        <Typography noWrap variant="body2" color="text.secondary">
                          {user.last_message || 'Không có tin nhắn'}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                ))
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">Không tìm thấy người dùng nào</Typography>
                </Box>
              )}
            </List>
          </Grid>
          
          {/* Khu vực chat */}
          <Grid item xs={12} md={8} lg={9} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedUser ? (
              <>
                {/* Header chat */}
                <Box sx={{ 
                  p: 2, 
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Avatar 
                    alt={selectedUser.username || `User ${selectedUser.user_id}`} 
                    src={USER_AVATAR}
                    sx={{ width: 40, height: 40, mr: 2 }}
                  >
                    {selectedUser.username ? selectedUser.username.charAt(0).toUpperCase() : selectedUser.user_id}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {selectedUser.username || `User ID: ${selectedUser.user_id}`}
                    </Typography>
                    {selectedUser.email && (
                      <Typography variant="body2" color="text.secondary">
                        {selectedUser.email}
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                {/* Vùng hiển thị tin nhắn */}
                <Box sx={{ 
                  flexGrow: 1, 
                  overflowY: 'auto', 
                  p: 3,
                  bgcolor: theme.palette.background.default
                }}>
                  {loadingMessages ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : messages.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography color="text.secondary">Chưa có tin nhắn</Typography>
                    </Box>
                  ) : (
                    <Box>
                      {messages.map((msg, index) => (
                        <Box 
                          key={msg.id || index} 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: msg.flag ? 'flex-end' : 'flex-start',
                            mb: 2
                          }}
                        >
                          {!msg.flag && (
                            <Avatar 
                              src={USER_AVATAR} 
                              alt={selectedUser.username || `User ${selectedUser.user_id}`}
                              sx={{ 
                                mr: 1, 
                                width: 36, 
                                height: 36,
                                alignSelf: 'flex-end',
                                mb: 0.5
                              }}
                            >
                              {selectedUser.username ? selectedUser.username.charAt(0).toUpperCase() : selectedUser.user_id}
                            </Avatar>
                          )}
                          
                          <Box
                            sx={{
                              maxWidth: '75%',
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: msg.flag ? 'primary.main' : 'background.paper',
                              color: msg.flag ? 'primary.contrastText' : 'text.primary',
                              boxShadow: theme.shadows[1]
                            }}
                          >
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                              {msg.message}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                display: 'block', 
                                textAlign: 'right', 
                                mt: 0.5,
                                opacity: 0.7 
                              }}
                            >
                              {formatTime(msg.createdAt)}
                            </Typography>
                          </Box>
                          
                          {msg.flag && (
                            <Avatar 
                              src={ADMIN_AVATAR} 
                              sx={{ 
                                ml: 1, 
                                width: 36, 
                                height: 36,
                                alignSelf: 'flex-end',
                                mb: 0.5
                              }}
                            >
                              A
                            </Avatar>
                          )}
                        </Box>
                      ))}
                      <div ref={messagesEndRef} />
                    </Box>
                  )}
                </Box>
                
                {/* Input gửi tin nhắn */}
                <Box 
                  component="form" 
                  onSubmit={(e) => { e.preventDefault(); sendReply(); }}
                  sx={{ 
                    p: 2, 
                    borderTop: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <TextField
                    fullWidth
                    placeholder="Nhập tin nhắn trả lời..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    variant="outlined"
                    multiline
                    maxRows={3}
                    sx={{ mr: 1 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={<SendIcon />}
                    disabled={!replyText.trim()}
                    onClick={sendReply}
                    sx={{ height: 40 }}
                  >
                    Gửi
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="text.secondary">
                  Chọn một người dùng để xem tin nhắn
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}