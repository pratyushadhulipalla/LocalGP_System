import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FeedbackForm.css'; // Import your CSS file

const FeedbackForm = ({ appointmentId, doctorId }) => {
    const [rating, setRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState('');
    const [existingFeedback, setExistingFeedback] = useState(null); // State to hold existing feedback

    // const patientID = localStorage.getItem('user')
    // const Id = JSON.parse(patientID).patientId;
    // console.log("id",Id);

    const patientId = JSON.parse(localStorage.getItem('user'))?.patientId; 

    useEffect(() => {
        // Fetch existing feedback if it exists
        const fetchFeedback = async () => {
            try {
                const response = await axios.get(`/api/patient/feedback/${appointmentId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                setExistingFeedback(response.data); // Store existing feedback
            } catch (error) {
                console.log('No existing feedback found or error occurred:', error);
            }
        };

        fetchFeedback();
    }, [appointmentId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('/api/patient/submit-feedback', {
                appointmentId,
                patientId,
                doctorId,
                rating,
                feedbackText
                
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log("patient", patientId)

            alert(response.data.message);
            setExistingFeedback({ rating, feedbackText }); // Store submitted feedback
        } catch (error) {
            console.error('Failed to submit feedback', error);
            alert('Failed to submit feedback');
        }
    };

    return (
        <div className="feedback-form-container">
            {existingFeedback ? (
                <div className="submitted-feedback">
                    <h3>Your Feedback</h3>
                    <p><strong>Rating:</strong> {'★'.repeat(existingFeedback.rating)}{'☆'.repeat(5 - existingFeedback.rating)}</p>
                    <p><strong>Feedback:</strong> {existingFeedback.feedbackText}</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Rating:</label>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span 
                                key={star} 
                                className={`star ${star <= rating ? 'filled' : ''}`}
                                onClick={() => setRating(star)}
                            >
                                {star <= rating ? '★' : '☆'}
                            </span>
                        ))}
                    </div>
                    <div className="form-group">
                        <label>Feedback:</label>
                        <textarea
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder="Write your feedback here"
                        />
                    </div>
                    <button type="submit" className="submit-button">Submit Feedback</button>
                </form>
            )}
        </div>
    );
};

export default FeedbackForm;
