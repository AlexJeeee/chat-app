import React, { useEffect, useState } from 'react';
import { PageHeader, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import queryString from 'query-string';
import io from 'socket.io-client';
import { Page, ChatRoom } from './style';
import { Message } from './components';

interface Msg {
  nickName: string;
  text: string;
  createdDate: number;
}

interface NewMsg {
  from: string;
  text: string;
  room: string;
  createdDate: number;
}

const socket = io('http://localhost:8080');

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const { query } = queryString.parseUrl(window.location.href);
    if (query.username) {
      const params = {
        name: query.username,
        room: 'static',
      }
      socket.emit('join', params, (err: any) => {
        if (err) {
          console.log(err);
        }
      });
    }
  }, [])

  socket.on('newMessage', (message: NewMsg) => {
    setMessages(messages.concat([{
      nickName: message.from,
      text: message.text,
      createdDate: message.createdDate,
    }]))
  });

  const scrollToBottom = () => {
    const chat = document.getElementById('chat-room');
    if (chat) {
      window.scroll(0, chat.scrollHeight)
    }
  }

  const onSend = () => {
    if (!inputMessage) {
      message.warn('无法发送空内容！').then(() => {})
      return;
    }
    socket.emit(
      'createMessage',
      { text: inputMessage },
      () => {}
    );
    setInputMessage('')
    scrollToBottom();
  }

  return (
    <Page id="chat">
      <PageHeader
        onBack={() => {navigate(-1)}}
        title="Chat Room"
        subTitle="Let's chat"
        style={{ position: 'sticky', top: 0 }}
      />
      <ChatRoom id="chat-room">
        {messages.map((item, index) => (
          <Message key={`${item.nickName}${index}`} msg={item} />
        ))}
        <Input.Group compact style={{ position: 'fixed', bottom: 10 }}>
          <Input.Search
            value={inputMessage}
            onChange={(e) => {setInputMessage(e.target.value)}}
            style={{ width: 'calc(100% - 70px)' }}
            enterButton="send"
            onSearch={onSend}
          />
        </Input.Group>
      </ChatRoom>
    </Page>
  )
}

export default Chat;