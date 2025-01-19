import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './DoctorCalendar.css';
import axios from 'axios';

const localizer = momentLocalizer(moment);

const DoctorCalendar = () => {
    const [events, setEvents] = useState([]);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const response = await axios.get('/api/doctor/details', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const doctor = response.data;
                const availabilityEvents = doctor.availability.map(a => ({
                    start: new Date(a.startTime),
                    end: new Date(a.endTime),
                    title: 'Available'
                }));
                setEvents(availabilityEvents);
            } catch (error) {
                console.error('Error fetching doctor details:', error);
            }
        };

        fetchAvailability();
    }, []);

    const handleSelectSlot = ({ start, end }) => {
        if (editMode) {
            const newEvent = {
                start,
                end,
                title: 'Available'
            };
            setEvents([...events, newEvent]);
        }
    };

    const handleEventClick = event => {
        if (editMode) {
            setEvents(events.filter(e => e !== event));
        }
    };

    const isValidDate = d => {
        return d instanceof Date && !isNaN(d);
    };

    const saveAvailability = async () => {
        try {
            const formattedAvailability = events.map(event => {
                const start = new Date(event.start);
                const end = new Date(event.end);

                console.log('Event Start:', start);
                console.log('Event End:', end);

                if (!isValidDate(start) || !isValidDate(end)) {
                    throw new Error('Invalid date value');
                }

                return {
                    startTime: start.toISOString(),
                    endTime: end.toISOString(),
                    dayOfWeek: moment(start).format('dddd')
                };
            });

            console.log('Formatted Availability:', formattedAvailability);

            const response = await axios.put('/api/doctor/update-availability', formattedAvailability, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            console.log('Response:', response.data);

            setEditMode(false);
            alert('Availability updated successfully');
        } catch (error) {
            console.error('Error updating availability:', error);

            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            } else if (error.request) {
                console.error('Request data:', error.request);
            } else {
                console.error('Error message:', error.message);
            }

            alert('Failed to update availability');
        }
    };

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <h2>Doctor's Availability Calendar</h2>
                {editMode ? (
                    <>
                        <button onClick={saveAvailability}>Save</button>
                        <button onClick={() => setEditMode(false)}>Cancel</button>
                    </>
                ) : (
                    <button onClick={() => setEditMode(true)}>Edit Availability</button>
                )}
            </div>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                selectable={editMode}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleEventClick}
                style={{ height: 500 }}
                className="calendar"
            />
        </div>
    );
};

export default DoctorCalendar;
