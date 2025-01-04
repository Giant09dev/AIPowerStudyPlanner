"use client";

import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const TaskScheduler = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Sample Event",
      start: "2025-01-02T08:00:00",
      end: "2025-01-02T10:00:00",
    },
    {
      id: 2,
      title: "Another Event",
      start: "2025-01-03T08:00:00",
      end: "2025-01-03T10:00:00",
    },
  ]);

  const handleDrop = (info) => {
    const newEvent = {
      title: info.draggedEl.innerText, // Get the event title from the dragged element
      start: info.event.start,
      end: info.event.end,
    };

    // Add the new event to the calendar
    setEvents((prevEvents) => [...prevEvents, newEvent]);
  };

  return (
    <div>
      {/* External events (can be dragged) */}
      <div
        id="external-events"
        style={{
          height: "300px",
          overflowY: "scroll",
          border: "1px solid #ccc",
          padding: "10px",
        }}
      >
        <div
          className="fc-event"
          draggable
          style={{
            width: "200px",
            height: "50px",
            backgroundColor: "#f0f0f0",
            marginBottom: "10px",
            padding: "10px",
            border: "1px solid #ccc",
            cursor: "move",
          }}
        >
          Sample Event
        </div>
        <div
          className="fc-event"
          draggable
          style={{
            width: "200px",
            height: "50px",
            backgroundColor: "#f0f0f0",
            marginBottom: "10px",
            padding: "10px",
            border: "1px solid #ccc",
            cursor: "move",
          }}
        >
          Another Event
        </div>
      </div>

      {/* FullCalendar component */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        editable={true}
        droppable={true} // Enable dropping of external events onto the calendar
        events={events}
        eventReceive={handleDrop} // This handles the drop of external events
        eventDrop={handleDrop} // This handles the drop of external events
        eventAllow={handleDrop}
        timeZone="UTC"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        drop={(info) => {
          info.preventDefault();
        }}
      />
    </div>
  );
};

export default TaskScheduler;
