import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './DoctorCalendar.css';
import axios from 'axios';
import AvailabilityModal from './AvailabilityModal';
import ReactDOM from 'react-dom';


const localizer = momentLocalizer(moment);

const DoctorCalendar = () => {
    const [events, setEvents] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const fetchAvailability = async () => {
        try {
            const response = await axios.get('/api/doctor/availability', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            console.log('Fetched availability:', response.data);

            const uniqueEvents = response.data.map(event => ({
                start: moment(event.date).set({ hour: event.startTime.split(':')[0], minute: event.startTime.split(':')[1] }).toDate(),
                end: moment(event.date).set({ hour: event.endTime.split(':')[0], minute: event.endTime.split(':')[1] }).toDate(),
                title: event.isHoliday ? 'Holiday' : 'Available',
                allDay: event.startTime === '00:00:00' && event.endTime === '00:00:00',
                bgColor: event.isHoliday ? 'red !important;'  : 'lightgreen',
                isHoliday: event.isHoliday
            }));

            setEvents(uniqueEvents);
        } catch (error) {
            console.error('Error fetching availability:', error);
        }
    };

    useEffect(() => {
        fetchAvailability();
    }, []);

    const handleSelectSlot = ({ start, end }) => {
        if (editMode) {
            setSelectedEvent({ start, end, title: 'Available' });
        } else {
            alert('Switch to edit mode to add or update availability.');
        }
    };

    const handleSelectEvent = event => {
        if (editMode) {
            setSelectedEvent(event);
        }
    };

    const addAvailability = async (date, startTime, endTime) => {
        try {
            // Check for duplicates before adding
            const existingEvent = events.find(event => moment(event.start).isSame(date, 'day'));
            if (existingEvent) {
                alert('Availability already exists for this date.');
                return;
            }
            const formattedDate = moment(date).format('YYYY-MM-DD');
            const formattedStartTime = moment(startTime, 'HH:mm:ss').format('HH:mm:ss');
            const formattedEndTime = moment(endTime, 'HH:mm:ss').format('HH:mm:ss');
            const dayOfWeek = moment(date).format('dddd'); // Get the day of the week

            console.log(`Adding availability for date: ${formattedDate}, startTime: ${formattedStartTime}, endTime: ${formattedEndTime}`);
            
            const response = await axios.post('/api/doctor/add-availability-date', {
                date: formattedDate, // Local date
                startTime: formattedStartTime, // Local time
                endTime: formattedEndTime, // Local time
                dayOfWeek: dayOfWeek
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            const newEvent = {
                start: moment(response.data.date).set({ hour: response.data.startTime.split(':')[0], minute: response.data.startTime.split(':')[1] }).toDate(),
                end: moment(response.data.date).set({ hour: response.data.endTime.split(':')[0], minute: response.data.endTime.split(':')[1] }).toDate(),
                title: 'Available',
                bgColor: 'lightgreen',
                isHoliday: response.data.isHoliday
            };

            setEvents(prevEvents => [...prevEvents, newEvent]);
            alert('Availability added successfully');
        } catch (error) {
            console.error('Error adding availability:', error);
            alert('Failed to add availability');
        }
    };

    const saveAvailability = async () => {
        try {
            const formattedAvailability = events.map(event => ({
                startTime: moment(event.start).format('HH:mm:ss'),
                endTime: moment(event.end).format('HH:mm:ss'),
                date: moment(event.start).format('YYYY-MM-DD')
            }));

            const response = await axios.put('/api/doctor/update-availability', formattedAvailability, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            setEditMode(false);
            alert('Availability updated successfully');
            fetchAvailability(); // Refresh availability after updating
        } catch (error) {
            console.error('Error updating availability:', error);
            alert('Failed to update availability');
        }
    };

    const addHoliday = async date => {
        try {
            const holidayDate = new Date(date);
            console.log(`Adding holiday for date: ${holidayDate.toISOString()}`);
            const response = await axios.post('/api/doctor/add-holiday', { date: holidayDate.toISOString() }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            alert('Holiday added successfully');
            fetchAvailability(); // Refresh availability after adding holiday
        } catch (error) {
            console.error('Error adding holiday:', error);
            alert('Failed to add holiday');
        }
    };

    const deleteHoliday = async date => {
        try {
            const holidayDate = moment(date).format('YYYY-MM-DD');
            console.log(`Deleting holiday for date: ${holidayDate}`);
            const response = await axios.delete(`/api/doctor/delete-holiday/${holidayDate}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            alert('Holiday deleted successfully');
            fetchAvailability(); // Refresh availability after deleting holiday
        } catch (error) {
            console.error('Error deleting holiday:', error);
            alert('Failed to delete holiday');
        }
    };

    const deleteAvailability = async date => {
        try {
            const availabilityDate = moment(date).format('YYYY-MM-DD');
            console.log(`Deleting availability for date: ${availabilityDate}`);
            const response = await axios.delete(`/api/doctor/delete-availability/${availabilityDate}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            alert('Availability deleted successfully');
            fetchAvailability(); // Refresh availability after deleting
        } catch (error) {
            console.error('Error deleting availability:', error);
            alert('Failed to delete availability');
        }
    };

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <h2>Doctor's Availability Calendar</h2>
                {editMode ? (
                    <div className='calendar-editbuttons'>
                        <button onClick={saveAvailability}>Save</button>
                        <button onClick={() => setEditMode(false)}>Cancel</button>
                    </div>
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
                onSelectEvent={handleSelectEvent}
                style={{ height: 500 }}
                className="calendar"
                views={['month']}
                defaultView="month"
                eventPropGetter={event => ({
                    style: { backgroundColor: event.isHoliday ? 'red' : 'lightgreen' }
                })}
            />
            {selectedEvent && ReactDOM.createPortal(
                <AvailabilityModal
                    event={selectedEvent}
                    onSave={(updatedEvent) => {
                        setEvents(events.map(event => (event === selectedEvent ? updatedEvent : event)));
                        setSelectedEvent(null);
                    }}
                    onDelete={() => {
                        if (selectedEvent.isHoliday) {
                            deleteHoliday(selectedEvent.start);
                        } else {
                            deleteAvailability(selectedEvent.start);
                        }
                        setSelectedEvent(null);
                    }}
                    onClose={() => setSelectedEvent(null)}
                    addAvailability={addAvailability}
                    addHoliday={addHoliday}
                    deleteHoliday={deleteHoliday}
                />,
                document.body
            )}
        </div>
    );
};

export default DoctorCalendar;
