import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserDetails.css'; // Add styles for this component
import { json, useLocation } from 'react-router-dom';

const UserDetails = () => {
    const location = useLocation();
    const { user, role } = location.state || {};
    const userId = JSON.parse(localStorage.getItem('user'))?.userId; 
    console.log('id:',userId)
    
    
    const [userDetails, setUserDetails] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phoneNumber: '',
        address: '',
        city: '',
        country: '',
        postCode: '',
        dateOfBirth: '',
        gender: '',
        specialization: '',
        yearsOfExperience: null,
        availability: [],
        education: '',
        licenseNumber: '',
    });
    const [emergencyContacts, setEmergencyContacts] = useState([]);
    const [newContact, setNewContact] = useState({ contactName: '', relation: '', mobileNumber: '', address: '' });
    const [selectedContact, setSelectedContact] = useState(null);

    const [editMode, setEditMode] = useState(false);
    const [contactEditMode, setContactEditMode] = useState(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await axios.get(`/api/${role}/details`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                const userDetails = response.data;
                if (userDetails.dateOfBirth) {
                    userDetails.dateOfBirth = formatDateForInput(userDetails.dateOfBirth);
                }

                const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                const existingAvailability = userDetails.availability || [];
                const availability = allDays.map(day => {
                    const dayAvailability = existingAvailability.find(a => a.dayOfWeek === day);
                    return dayAvailability || { dayOfWeek: day, startTime: '', endTime: '' };
                });

                setUserDetails({ ...userDetails, availability });

                // Fetch emergency contacts
                const contactsResponse = await axios.get(`/api/emergencycontacts/user/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setEmergencyContacts(contactsResponse.data);
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };
        
        if(!user){
        fetchUserDetails();}
        else{
            console.log(`Fetching details for userId: ${userId}`);
            console.log("currentuserrole",localStorage.getItem('roles'))
            console.log("Received user data:", user); // Debugging: Check what user data is received

           setUserDetails({...userDetails,
            firstName:user.firstName,
            lastName: user.lastName,
        username: user.userName,
        email:user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        city: user.city,
        country: user.country,
        postCode: user.postCode,
        dateOfBirth: user.dateOfBirth.split('T')[0],
        gender: user.gender,
        specialization:  user.doctorDetails?.specialization || '',
        yearsOfExperience:  user.doctorDetails?.yearsOfExperience || null,
        education:  user.doctorDetails?.education || '',
        licenseNumber: user.doctorDetails?.licenseNumber || '',
        
           })
        }
    }, [role]);

    const handleChange = (e) => {
        setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
    };

    const handleAvailabilitySave = async () => {
        try {
            const formattedAvailability = userDetails.availability.map(avail => ({
                ...avail,
                startTime: avail.startTime.length === 5 ? `${avail.startTime}:00` : avail.startTime,
                endTime: avail.endTime.length === 5 ? `${avail.endTime}:00` : avail.endTime
            }));
    
            await axios.put(`/api/doctor/update-availability`, formattedAvailability, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
    
            console.log("Availability updated successfully");
        } catch (error) {
            console.error("Error updating availability:", error);
        }
    };
    


    const handleAvailabilityChange = (e, index, field) => {
        const newAvailability = [...userDetails.availability];
        newAvailability[index][field] = e.target.value;
        setUserDetails({ ...userDetails, availability: newAvailability });
    };

    const handleSave = async () => {
        try {
            const formattedDetails = { ...userDetails };
    
            if (formattedDetails.dateOfBirth) {
                formattedDetails.dateOfBirth = formatDateForServer(formattedDetails.dateOfBirth);
            }
    
            const formattedAvailability = formattedDetails.availability.map(avail => ({
                ...avail,
                startTime: avail.startTime ? (avail.startTime.length === 5 ? `${avail.startTime}:00` : avail.startTime) : "00:00:00",
                endTime: avail.endTime ? (avail.endTime.length === 5 ? `${avail.endTime}:00` : avail.endTime) : "00:00:00"
            }));

            formattedDetails.availability = formattedAvailability;

            console.log("Formatted details before sending:", JSON.stringify(formattedDetails, null, 2));  // Log the formatted details
            if(localStorage.getItem('roles')!='Admin'){
            const response = await axios.put(`/api/${role}/update`, formattedDetails, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });console.log("Response from server:", response.data);
        }else{
            const UserId=userId
                const response = await axios.put(`/api/admin/update-user-details/${UserId}`,formattedDetails,{
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                console.log("Response from server:", response.data);
            }
    
            
    
            setEditMode(false);
            console.log("User details updated successfully");
        } catch (error) {
            console.error("Error updating user details:", error);
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
                console.error("Response headers:", error.response.headers);
            }
        }
    };
    

    const handleCancel = () => {
        setEditMode(false);
        // Fetch details to reset changes
        const fetchUserDetails = async () => {
            try {
                const response = await axios.get(`/api/${role}/details`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                const userDetails = response.data;
                if (userDetails.dateOfBirth) {
                    userDetails.dateOfBirth = formatDateForInput(userDetails.dateOfBirth);
                }

                const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                const existingAvailability = userDetails.availability || [];
                const availability = allDays.map(day => {
                    const dayAvailability = existingAvailability.find(a => a.dayOfWeek === day);
                    return dayAvailability || { dayOfWeek: day, startTime: '', endTime: '' };
                });

                setUserDetails({ ...userDetails, availability });
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        fetchUserDetails();
    };

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const formatDateForInput = (dateString) => dateString.split('T')[0];
    const formatDateForServer = (dateString) => dateString;

    const handleNewContactChange = (e) => {
        setNewContact({ ...newContact, [e.target.name]: e.target.value });
    };

    const handleAddContact = async () => {
        
        try {
            const contactData = {
                ...newContact,
               userId 
            };

            const response = await axios.post(`/api/emergencycontacts/add`, contactData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setEmergencyContacts([...emergencyContacts, response.data]);
            setNewContact({ contactName: '', relation: '', mobileNumber: '', address: '' });
        } catch (error) {
            console.error("Error adding emergency contact:", error);
        }
    };

    const handleEditContact = (index) => {
        setSelectedContact(emergencyContacts[index]);
        setContactEditMode(true);
    };


    const handleSaveContact = async () => {
        try {
            const updatedContact = selectedContact;
            await axios.put(`/api/emergencycontacts/${updatedContact.id}`, updatedContact, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const updatedContacts = emergencyContacts.map(contact =>
                contact.id === updatedContact.id ? updatedContact : contact
            );
            setEmergencyContacts(updatedContacts);
            setContactEditMode(false);
            setSelectedContact(null);
        } catch (error) {
            console.error("Error saving emergency contact:", error);
        }
    };

    const handleDeleteContact = async (id) => {
        try {
            await axios.delete(`/api/emergencycontacts/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setEmergencyContacts(emergencyContacts.filter(contact => contact.id !== id));
            setSelectedContact(null);
        } catch (error) {
            console.error("Error deleting emergency contact:", error);
        }
    };
    const handleContactChange = (e) => {
        setSelectedContact({ ...selectedContact, [e.target.name]: e.target.value });
    };

    const handleContactClick = (contact) => {
        setSelectedContact(contact);
    };

    const closeContactModal = () => {
        setSelectedContact(null);
        setContactEditMode(false);
    };

    return (
        <div className="user-details-container">
            <div className='userdetails'>
            <h2>User Details</h2>
            {role === 'Doctor' && (
            <div>
                    <label>License Number</label>
                    <input 
                        type="text" 
                        name="licenseNumber" 
                        value={userDetails.licenseNumber}  
                        onChange={handleChange} 
                        disabled={!editMode} 
                    />
                    <div className="verified-message">
                        Verified
                        <i className="fas fa-check-circle verified-icon"></i>
                    </div>
                </div>
            )}

            <div>
                <label>First Name</label>
                <input type="text" name="firstName" value={userDetails.firstName} onChange={handleChange} disabled={!editMode} />
            </div>
            <div>
                <label>Last Name</label>
                <input type="text" name="lastName" value={userDetails.lastName} onChange={handleChange} disabled={!editMode} />
            </div>
            <div>
                <label>Username</label>
                <input type="text" name="username" value={userDetails.username} onChange={handleChange} disabled={!editMode} />
            </div>
            <div>
                <label>Email</label>
                <input type="email" name="email" value={userDetails.email} onChange={handleChange} disabled={!editMode} />
            </div>
            <div>
                <label>Phone Number</label>
                <input type="text" name="phoneNumber" value={userDetails.phoneNumber} onChange={handleChange} disabled={!editMode} />
            </div>
            <div>
                <label>Address</label>
                <input type="text" name="address" value={userDetails.address} onChange={handleChange} disabled={!editMode} />
            </div>
            <div>
                <label>City</label>
                <input type="text" name="city" value={userDetails.city} onChange={handleChange} disabled={!editMode} />
            </div>
            <div>
                <label>Country</label>
                <input type="text" name="country" value={userDetails.country} onChange={handleChange} disabled={!editMode} />
            </div>
            <div>
                <label>Post Code</label>
                <input type="text" name="postCode" value={userDetails.postCode} onChange={handleChange} disabled={!editMode} />
            </div>
            <div>
                <label>Date of Birth</label>
                <input type="date" name="dateOfBirth" value={userDetails.dateOfBirth} onChange={handleChange} disabled={!editMode} />
            </div>
            <div>
                <label>Gender</label>
                <select name="gender" value={userDetails.gender} onChange={handleChange} disabled={!editMode}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            {role === 'Doctor' && (
                <>
                    <div>
                        <label>Specialization</label>
                        <input type="text" name="specialization" value={userDetails.specialization} onChange={handleChange} disabled={!editMode} />
                    </div>
                    <div>
                        <label>Years of Experience</label>
                        <input type="number" name="yearsOfExperience" value={userDetails.yearsOfExperience} onChange={handleChange} disabled={!editMode} />
                    </div>
                    <div>
                        <label>Availability</label>
                        {userDetails.availability.map((avail, index) => (
                            <div key={index} className="availability-item">
                                <label>{avail.dayOfWeek}</label>
                                <input
                                    type="time"
                                    value={avail.startTime}
                                    onChange={(e) => handleAvailabilityChange(e, index, 'startTime')}
                                    disabled={!editMode}
                                />
                                <input
                                    type="time"
                                    value={avail.endTime}
                                    onChange={(e) => handleAvailabilityChange(e, index, 'endTime')}
                                    disabled={!editMode}
                                />
                            </div>
                        ))}
                    </div>

                    <div>
                        <label>Education</label>
                        <input type="text" name="education" value={userDetails.education} onChange={handleChange} disabled={!editMode} />
                    </div>
                </>
            )}



            
            <div>
                {editMode ? (
                    <>
                        <button onClick={handleSave}>Save</button>
                        <button onClick={handleCancel}>Cancel</button>
                    </>
                ) : (
                    <button onClick={() => setEditMode(true)}>Edit</button>
                )}
            </div>
            </div>

            <div className='EmergencyContacts'>
                <h3>Emergency Contacts</h3>
                {emergencyContacts.map((contact, index) => (
                    <button key={index} onClick={() => handleContactClick(contact)}>
                        {contact.contactName}
                    </button>
                ))}
                <div className="new-emergency-contact">
                    <h4>Add New Emergency Contact</h4>
                    <input
                        type="text"
                        name="contactName"
                        value={newContact.contactName}
                        onChange={handleNewContactChange}
                        placeholder="Contact Name"
                    />
                    <input
                        type="text"
                        name="relation"
                        value={newContact.relation}
                        onChange={handleNewContactChange}
                        placeholder="Relation"
                    />
                    <input
                        type="text"
                        name="mobileNumber"
                        value={newContact.mobileNumber}
                        onChange={handleNewContactChange}
                        placeholder="Mobile Number"
                    />
                    <input
                        type="text"
                        name="address"
                        value={newContact.address}
                        onChange={handleNewContactChange}
                        placeholder="Address"
                    />
                    <button onClick={handleAddContact}>Add Contact</button>
                </div>
            </div>

            {selectedContact && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close-button" onClick={closeContactModal}>&times;</span>
                        <h3>Emergency Contact Details</h3>
                        {contactEditMode ? (
                            <>
                                <input
                                    type="text"
                                    name="contactName"
                                    value={selectedContact.contactName}
                                    onChange={handleContactChange}
                                />
                                <input
                                    type="text"
                                    name="relation"
                                    value={selectedContact.relation}
                                    onChange={handleContactChange}
                                />
                                <input
                                    type="text"
                                    name="mobileNumber"
                                    value={selectedContact.mobileNumber}
                                    onChange={handleContactChange}
                                />
                                <input
                                    type="text"
                                    name="address"
                                    value={selectedContact.address}
                                    onChange={handleContactChange}
                                />
                                <button onClick={handleSaveContact}>Save</button>
                            </>
                        ) : (
                            <>
                                <p>Name: {selectedContact.contactName}</p>
                                <p>Relation: {selectedContact.relation}</p>
                                <p>Mobile: {selectedContact.mobileNumber}</p>
                                <p>Address: {selectedContact.address}</p>
                                <button onClick={() => handleEditContact(emergencyContacts.indexOf(selectedContact))}>Edit</button>
                                <button onClick={() => handleDeleteContact(selectedContact.id)}>Delete</button>
                            </>
                        )}
                    </div>
                </div>
            )}

            
        </div>
        

        
    );
};

export default UserDetails;
