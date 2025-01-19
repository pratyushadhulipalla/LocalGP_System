import React, { useState, useEffect, useContext } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import FirebaseContext from '../components/firebase';  // Import FirebaseContext
import './AdminChat.css'; 

const AdminChat = () => {
  const { db } = useContext(FirebaseContext);  // Access db from FirebaseContext
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  // const [groupedMessages, setGroupedMessages] = useState({});
  const [selectedUser, setSelectedUser] = useState(null); 
  const [userid, setUserid] = useState([]);

  useEffect(() => {
    if (!db) {
      console.error('Firestore is not initialized');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    const patientName = user?.username || 'Unknown User'; // Retrieve the patientId from the stored user data
            console.log("patietname", patientName);

    
        setUserid(patientName);

    const q = query(collection(db, 'chat'), orderBy('timestamp'));  // Query Firestore 'chat' collection
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => doc.data());
    

    //  // Group messages by userid (patient)
    //  const grouped = fetchedMessages.reduce((acc, msg) => {
    //   const { userid } = msg;
    //   if (!acc[userid]) {
    //     acc[userid] = [];
    //   }
    //   acc[userid].push(msg);
    //   return acc;
    // }, {});

    setMessages(fetchedMessages);
    // setGroupedMessages(grouped);  // Set the grouped messages
  });

    return () => unsubscribe();  // Clean up the subscription on component unmount
  }, [db]);  // Only run when db is available

  const handleSelectUser = (userid) => {
    setSelectedUser(userid);  // Set the selected user when clicked
  };


  const sendMessage = async () => {
    if (message.trim() && selectedUser) {
      await addDoc(collection(db, 'chat'), {
        sender: 'admin',  // The sender is the admin
        userid:selectedUser,
        text: message,
        timestamp: new Date(),
        read:false
      });
      setMessage('');  // Clear message input after sending
    }
  };

  const filteredMessages = messages.filter(
    (msg) => msg.userid === selectedUser || (msg.sender === 'admin' && msg.userid === selectedUser)
  );

  return (
    <div className="admin-chat-container">
      {/* Sidebar for displaying users (patients) */}
      <div className="user-list">
        <h3>Users</h3>
        <ul>
          {Array.from(new Set(messages.map((msg) => msg.userid))).map((userid) => (
            <li key={userid} onClick={() => handleSelectUser(userid)} className={selectedUser === userid ? 'selected' : ''}>
              {userid}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat messages display */}
      <div className="messages-section">
        <h3>{selectedUser ? `Chat with ${selectedUser}` : 'Select a User'}</h3>
        <div className="messages">
          {filteredMessages.length > 0 ? (
            filteredMessages.map((msg, index) => (
              <div key={index} className={msg.sender === 'admin' ? 'admin-msg' : 'patient-msg'}>
                <div className="message-header">
                  <strong>{msg.sender === 'admin' ? 'Admin' : msg.userid}</strong>
                </div>
                <p>{msg.text}</p>
              </div>
            ))
          ) : (
            <p>No messages to display.</p>
          )}
        </div>

        {/* Input box for sending messages */}
        <div className="input-container">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={!selectedUser}  // Disable input if no user is selected
          />
          <button onClick={sendMessage} disabled={!selectedUser}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
