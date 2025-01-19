import React, { useState, useEffect } from 'react';
import moment from 'moment';
import './AvailabilityModal.css';

const AvailabilityModal = ({ event, onSave, onDelete, onClose, addAvailability, addHoliday, deleteHoliday }) => {
    const [start, setStart] = useState(event.start);
    const [end, setEnd] = useState(event.end);
    const [title, setTitle] = useState(event.title);
    const [isHoliday, setIsHoliday] = useState(event.isHoliday);

    useEffect(() => {
        setStart(event.start);
        setEnd(event.end);
        setTitle(event.title);
        setIsHoliday(event.isHoliday);
    }, [event]);

    const handleSave = () => {
        const updatedEvent = {
            ...event,
            start,
            end,
            title: isHoliday ? 'Holiday' : 'Available',
            bgColor: isHoliday ? 'red' : 'lightgreen'
        };
        if (isHoliday) {
            addHoliday(moment(start).format('YYYY-MM-DD'));
        } else {
            addAvailability(moment(start).format('YYYY-MM-DD'), moment(start).format('HH:mm:ss'), moment(end).format('HH:mm:ss'));
        }
        onSave(updatedEvent);
    };

    const handleDelete = () => {
        onDelete();
    };

    return (
        <div className="modal">
            <h2>{isHoliday ? 'Holiday' : 'Availability'} Details</h2>
            <label>
                Start Time:
                <input
                    type="time"
                    value={moment(start).format('HH:mm')}
                    onChange={e => setStart(moment(start).set({ hour: e.target.value.split(':')[0], minute: e.target.value.split(':')[1] }).toDate())}
                    disabled={isHoliday}
                />
            </label>
            <label>
                End Time:
                <input
                    type="time"
                    value={moment(end).format('HH:mm')}
                    onChange={e => setEnd(moment(end).set({ hour: e.target.value.split(':')[0], minute: e.target.value.split(':')[1] }).toDate())}
                    disabled={isHoliday}
                />
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={isHoliday}
                    onChange={() => setIsHoliday(!isHoliday)}
                />
                Mark as Holiday
            </label>
            <button onClick={handleSave}>Save</button>
            <button onClick={handleDelete}>Delete</button>
            <button onClick={onClose}>Close</button>
        </div>
    );
};

export default AvailabilityModal;
