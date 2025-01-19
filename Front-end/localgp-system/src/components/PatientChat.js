import React, { useState, useEffect, useContext } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import FirebaseContext from '../components/firebase';  // Import FirebaseContext
import './PatientChat.css';

const PatientChat = () => {
  const { db } = useContext(FirebaseContext);  // Access db from FirebaseContext
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userid, setUserid] = useState(''); 

  useEffect(() => {

    const user = JSON.parse(localStorage.getItem('user'));
    const patientName = user?.username || 'Unknown User'; // Retrieve the patientId from the stored user data
            console.log("patietname", patientName);

    
        setUserid(patientName);

    if (!db) {
      console.error('Firestore is not initialized');
      return;
    }

    

    const q = query(collection(db, 'chat'), orderBy('timestamp'));  // Query Firestore 'chat' collection
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs
        .map((doc) => doc.data())
        .filter(
          (msg) => 
            msg.userid === patientName ||(msg.sender === 'admin' && msg.userid === patientName) // Filter for current user's messages and admin messages
        );
      setMessages(fetchedMessages);
    });
    return () => unsubscribe();  // Clean up the subscription on component unmount
  }, [db]);  // Only run when db is available

  const sendMessage = async () => {
    if (message.trim()) {

      console.log('Sending message:', { sender: 'patient', userid, text: message })
      await addDoc(collection(db, 'chat'), {
        sender: 'patient',
        userid:userid,
        text: message,
        timestamp: new Date(),
        read:false
      });
      setMessage('');  // Clear message input after sending
    }
  };

  return (
    <div className="patient-chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
           <p key={index} className={msg.sender === 'admin' ? 'admin-msg' : 'patient-msg'}>
             <div className="message-header">
             <strong>{msg.sender === 'admin' ? 'Admin' : msg.userid}</strong>
                        </div>
           <div className='text'>
            {msg.text}</div>
       </p>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}  // Handle input change
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default PatientChat;
