import React, { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import { Button, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import Typography from '@mui/material/Typography';
import Textarea from '@mui/joy/Textarea';

import { DashboardContent } from 'src/layouts/dashboard';
import axiosInstance from 'src/utils/axios';
import { connectSocket, disconnectSocket, socket } from 'src/utils/socket';

export function ChatView() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState([]);
  const [messagesUser, setMessagesUser] = React.useState([]);
  const [value, setValue] = React.useState('');
  const [userActive, setUserActive] = useState();

  const toggleDrawer = (newOpen, user_id) => () => {
    setOpen(newOpen);
    if(newOpen && user_id) {
      setUserActive(user_id);
      fetchMessageUser(user_id);
    }
  };

  const fetchAllMessage = async () => {
    try {
      const data = await axiosInstance.get('/messages?filters%5Bgroup%5D=true');
      console.log(data);
      if(data?.data && data?.data.length > 0) {
        setMessages(data?.data)
      }
    } catch (error) {
      console.log(error);
    }
  }

  const fetchMessageUser = async (id) => {
    try {
      const data = await axiosInstance.get(`/messages?filters%5Buser_id%5D=${id}`);
      console.log(data);
      setMessagesUser(data.data);
      
     
    } catch (error) {
      console.log(error);
    }
  };

  const sendMessage = async () => {
    try {
      console.log(userActive);
      if (value.trim() !== '' && userActive) {
        const messageData = {
            user: userActive,
            message: value,
            flag: true
        };

        socket.emit('sendMessage', messageData);
        setValue('');
    }
    } catch (error) {
      
    }
  }

  useEffect(() => {
    fetchAllMessage();
  }, []);

  useEffect(() => {
    if(open) {
      connectSocket();
      socket.on('newMessage', (message) => {
        console.log(messages);

        setMessagesUser((oldMessages) => [...oldMessages, message]);
        const index  = messages.findIndex(item => {
          return item.user_id == userActive;
        });
        console.log(index);
        setMessages(prev => {
          prev[index].last_message = message.message;
          return prev;
        })
      });
    } else {
      disconnectSocket();
    }
    return () => {
      disconnectSocket();
    };
  }, [open]);

  const DrawerList = (
    <Box
      sx={{ width: 450 }}
      rlole="presentation"
      className='box_message'
    >
      <div className='box_message_title'>
        <div className='box_message_name'>
          name
        </div>
        <div className='box_message_status'>
          trạng thái
        </div>
      </div>
      <div className='box_message_content'>
        {
          messagesUser.length > 0 ? messagesUser.map((item, index) => (
            <div className={`${item.flag ? 'box_message_admin' : 'box_message_user'} box_message_item`}>
              { !item.flag && <div className='box_message_avatar box_message_user_avatar'></div> }
              <div>{item.message}</div>
              { item.flag && <div className='box_message_avatar box_message_admin_avatar'></div> }
            </div>
          )) : null
        }
      </div>
      <div className=''>
        <textarea
          rows="3"
          onChange={(event) => {setValue(event.target.value)}}
          value={value}
        />
        <div
          className=''
          onClick={sendMessage}
        >Gửi</div>
      </div>
    </Box>
  );

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Tin nhắn
      </Typography>
      <div className='message_list'>
        {
          messages.map((item, index) =>  (
            <div
              onClick={toggleDrawer(true, item.user_id)}
              className='message_item'
            >
              <div className='message_item_name'>{item.username ? item.username : 'no name'}</div>
              <div className='message_item_title'>{item.last_message ? item.last_message : ''}</div>
            </div>
          ))
        }
      </div>
      <Drawer
        open={open}
        onClose={toggleDrawer(false)}
        anchor='right'
      >
        {DrawerList}
      </Drawer>
    </DashboardContent>
  );
}
