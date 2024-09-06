import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const api_url = import.meta.env.VITE_SERVER_URL;

const socket = io(api_url, {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

function ChatBox({ gameId }: { gameId: string }): React.ReactElement {
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // socket.emit('joinGame', gameId);

    socket.on('receiveMessage', ({ message }) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('receiveMessages', (messages: string[]) => {
      setMessages(messages);
    });

    return () => {
      socket.emit('leaveGame', gameId);
      socket.off('receiveMessage');
      socket.off('receiveMessages');
    };
  }, [gameId]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('sendMessage', { gameId, message });
      setMessage('');
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default ChatBox;
