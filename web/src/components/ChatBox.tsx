import React, { useState, useEffect } from 'react';
import socket from '@/socket';

function ChatBox({ gameId }: { gameId: string }): React.ReactElement {
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    socket.on('receiveMessage', ({ sender, message }) => {
      setMessages((prevMessages) => [...prevMessages, { sender, message }]);
    });

    socket.on('fileShared', ({ sender, file }) => {
      setMessages((prevMessages) => [...prevMessages, { sender, file }]);
    });

    socket.on('receiveMessages', (messages: any[]) => {
      setMessages(messages);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('fileShared');
      socket.off('receiveMessages');
    };
  }, [gameId]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('sendMessage', { gameId, message });
      setMessage('');
    }
  };

  const sendFile = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const fileData = event.target?.result;
        socket.emit('shareFile', {
          gameId,
          file: { name: file.name, data: fileData },
        });
      };
      reader.readAsDataURL(file); // Read file as base64
      setFile(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender === socket.id ? 'You' : 'Opponent'}:</strong>{' '}
            {msg.message && <span>{msg.message}</span>}
            {msg.file && (
              <div>
                <span>File: {msg.file.name}</span>
                <br />
                <a href={msg.file.data} download={msg.file.name}>
                  Download {msg.file.name}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
      <input
        type='text'
        value={message}
        placeholder='Type your message...'
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
      <br />
      <input type='file' onChange={handleFileChange} />
      <button onClick={sendFile}>Send File</button>
    </div>
  );
}

export default ChatBox;