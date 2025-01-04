"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button, Modal } from "react-bootstrap";
import axios from "axios";

const EventModal = ({ isOpen, event, onClose, onSave, onDelete }) => {
  if (!isOpen) return null;
  const startDate = new Date(event.startStr);
  const endDate = new Date(event.endStr);
  const isAllDayEvent =
    event.startStr.split("T")[0] === event.endStr.split("T")[0] &&
    startDate.getHours() === 0 &&
    startDate.getMinutes() === 0 &&
    startDate.getSeconds() === 0 &&
    endDate.getHours() === 23 &&
    endDate.getMinutes() === 59 &&
    endDate.getSeconds() === 59;

  console.log(`isOpen: ${isOpen}`);

  const handleSaveAndDrop = () => {
    onSave("allDay");
    onClose();
  };

  return (
    <Modal show={isOpen} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{`Event: ${event.title}`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>Title:</strong> {event.title}
        </p>
        <p>
          <strong>Description:</strong> {event.extendedProps.description}
        </p>
        <p>
          <strong>Priority:</strong> {event.extendedProps.priority}
        </p>
        <p>
          <strong>Start:</strong> {startDate.toLocaleString()}
        </p>
        <p>
          <strong>End:</strong> {endDate.toLocaleString()}
        </p>

        <p>Choose an action:</p>
        <div className="text-end">
          <Button
            variant="primary"
            disabled={isAllDayEvent} // Disable if already an all-day event
            onClick={() => {
              onSave("allDay");
              onClose();
            }}
          >
            Make it lasts all-day
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="ms-2"
          >
            Delete
          </Button>
          <Button variant="secondary" onClick={onClose} className="ms-2">
            Cancel
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

const apiData = [
  {
    _id: "1",
    taskName: "Complete NestJS AP",
    description: "Build a RESTful API for task management",
    status: "Todo",
    startDate: "2025-01-02T09:00:00.000+00:00",
    endDate: "2025-01-02T18:00:00.000+00:00",
    priority: "High",
    uid: "BUUJ5YDm7OUZuHhbPSimLxwtAVY2",
    __v: 0,
  },
  {
    _id: "2",
    taskName: "Complete NestJS APIIII",
    description: "Build a RESTful API for task management",
    status: "Todo",
    startDate: "2025-01-02T08:00:00.000+00:00",
    endDate: "2025-01-02T18:00:00.000+00:00",
    priority: "High",
    uid: "BUUJ5YDm7OUZuHhbPSimLxwtAVY2",
    __v: 0,
  },
  {
    _id: "3",
    taskName: "Complete NestJS APIIII",
    description: "Build a RESTful API for task management",
    status: "Todo",
    startDate: "2025-01-02T08:00:00.000+00:00",
    endDate: "2025-01-02T18:00:00.000+00:00",
    priority: "High",
    uid: "BUUJ5YDm7OUZuHhbPSimLxwtAVY2",
    __v: 0,
  },
  {
    _id: "4",
    taskName: "Complete NestJS APIIII",
    description: "Build a RESTful API for task management",
    status: "Todo",
    startDate: "2025-01-02T08:00:00.000+00:00",
    endDate: "2025-01-02T18:00:00.000+00:00",
    priority: "High",
    uid: "BUUJ5YDm7OUZuHhbPSimLxwtAVY2",
    __v: 0,
  },
];

const FullCalendarView = () => {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Hàm lấy dữ liệu sự kiện từ API
  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ); // Gọi API
      const data = response.data.map(transformEventData);
      setEvents(data); // Cập nhật dữ liệu sự kiện vào state
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };
  // const fetchEvents = async () => {
  //   try {
  //     console.log(`apiData: ${apiData[0]._id}`);
  //     const response = apiData.map(transformEventData);
  //     console.log(`response: ${response[0].start}`);
  //     setEvents(response); // Cập nhật dữ liệu sự kiện vào state
  //     console.log(`events: ${events}`);
  //   } catch (error) {
  //     console.error("Error fetching events:", error);
  //   }
  // };

  // Gọi API khi component mount
  useEffect(() => {
    fetchEvents();
  }, []);
  useEffect(() => {
    console.log(`Updated events: ${JSON.stringify(events)}`); // Kiểm tra state sau khi thay đổi
  }, [events]); // Lắng nghe sự thay đổi của `events`

  const transformEventData = (data) => {
    return {
      id: data._id, // ID của sự kiện
      title: data.taskName, // Tiêu đề sự kiện
      start: new Date(data.startDate).toISOString(), // Chuyển startDate thành ISO String
      end: new Date(data.endDate).toISOString(), // Chuyển endDate thành ISO String
      description: data.description, // Mô tả sự kiện
      priority: data.priority, // Mức độ ưu tiên
      status: data.status,
    };
  };

  const handleDateSelect = (selectInfo) => {
    let title = prompt("Enter a new title for your event");
    let calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      setEvents((prevEvents) => {
        const newEvent = {
          id: String(prevEvents.length + 1),
          title,
          start: selectInfo.startStr,
          end: selectInfo.endStr,
        };
        const updatedEvents = [...prevEvents, newEvent];

        // Log the event just added
        console.log("Event added:", newEvent);
        console.log("Updated events:", updatedEvents);

        return updatedEvents;
      });
    }
  };

  const handleSave = (action) => {
    console.log(`action: ${action}`);
    console.log(`selectedEvent: ${selectedEvent.start}`);
    if (action === "allDay") {
      const updatedEvent = {
        ...selectedEvent.toPlainObject(),
        start: selectedEvent.startStr.split("T")[0] + "T00:00:00", // Chỉ cần ngày (Không có giờ)
        end: selectedEvent.endStr.split("T")[0] + "T23:59:59", // Chỉ cần ngày (Không có giờ)
        allDay: true,
      };

      console.log(`updatedEvent: ${updatedEvent.start}`);
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === selectedEvent.id ? updatedEvent : event
        )
      );
    }
  };

  const handleDelete = (eventId) => {
    const isDelete = window.confirm(`Do you want to delete this event?`);

    if (isDelete) {
      // Cập nhật lại state, xóa sự kiện có id trùng khớp với eventId
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventId)
      );
    }
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setIsModalOpen(true);
  };

  const handleEventDrop = (info) => {
    const updatedEvents = events.map((event) =>
      event.id === info.event.id
        ? { ...event, start: info.event.startStr, end: info.event.endStr }
        : event
    );
    setEvents(updatedEvents);
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        editable={true}
        selectable={true}
        events={events}
        timeZone="UTC"
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        eventContent={(arg) => (
          <div>
            <b>{arg.timeText}</b>
            <i>{arg.event.title}</i>
            <p>{arg.event.extendedProps.description}</p>
            <small>Priority: {arg.event.extendedProps.priority}</small>
          </div>
        )}
      />

      <EventModal
        isOpen={isModalOpen}
        event={selectedEvent}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default FullCalendarView;
