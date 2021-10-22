import { api } from '../../services/api';
import styles from './styles.module.scss';
import logoImg from '../../assets/logo.svg';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

interface IUserData{
  name: string;
  login: string;
  avatar_url: string;
}

interface IMessageItem{
  id: string;
  text: string;
  user: IUserData;
}

const messagesQueue: IMessageItem[] = [];

const socket = io('http://localhost:4000');

socket.on('new_message', (newMessage: IMessageItem) => {
  messagesQueue.push(newMessage);
});

export function MessageList(){

  const [messages, setMessages] = useState<IMessageItem[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      if(messagesQueue.length > 0){
        setMessages(prevState => [
          messagesQueue[0],
          prevState[0],
          prevState[1]
        ].filter(Boolean));
        messagesQueue.shift();
      }
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    api.get<IMessageItem[]>("/messages/last-three").then(response => {
      setMessages(response.data)
    });
  },[]);

  return(
    <div className={styles.messageListWrapper}>
      <img src={logoImg} alt="DoWhile 2021" />
      <ul className={styles.messageList}>
        {messages.map(message => {
          return(
            <li key={message.id} className={styles.message}>
              <p className={styles.messageContent}>{message.text}</p>
              <div className={styles.messageUser}>
                <div className={styles.userImage}>
                  <img src={message.user.avatar_url} alt={message.user.name} />
                </div>
                <span>{message.user.name}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
