import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './DoctorCalendar.css';
import axios from 'axios';

const localizer = momentLocalizer(moment);

const ReadOnlyDoctorCalendar = ({ doctorId }) => {
    const [events, setEvents] = useState([]);

    const fetchAvailability = async () => {
        try {
            const response = await axios.get(`/api/patient/doctor/${doctorId}/availability`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            const uniqueEvents = response.data
                .filter(event => event.startTime !== "00:00:00" && event.endTime !== "00:00:00")
                .map(event => ({
                    start: moment(event.date).set({ hour: event.startTime.split(':')[0], minute: event.startTime.split(':')[1] }).toDate(),
                    end: moment(event.date).set({ hour: event.endTime.split(':')[0], minute: event.endTime.split(':')[1] }).toDate(),
                    title: event.isHoliday ? 'Holiday' : 'Available',
                    allDay: event.startTime === '00:00:00' && event.endTime === '00:00:00',
                    bgColor: event.isHoliday ? 'red' : 'lightgreen',
                }));

            setEvents(uniqueEvents);
        } catch (error) {
            console.error('Error fetching availability:', error);
        }
    };

    useEffect(() => {
        fetchAvailability();
    }, [doctorId]);

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <h2>Doctor's Availability Calendar</h2>
            </div>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                className="calendar"
                views={['month']}
                defaultView="month"
                eventPropGetter={event => ({
                    style: { backgroundColor: event.bgColor }
                })}
            />
        </div>
    );
};

export default ReadOnlyDoctorCalendar;
