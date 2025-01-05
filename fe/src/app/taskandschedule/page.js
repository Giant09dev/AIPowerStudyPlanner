"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";

import {
  Button,
  Card,
  Container,
  Row,
  Col,
  Form,
  Modal,
} from "react-bootstrap";
import { useRouter } from "next/navigation";
import { FaEdit, FaInfoCircle, FaTrashAlt } from "react-icons/fa"; // Import the icons
import DatePicker from "react-datepicker"; // Import the DatePicker component
import "react-datepicker/dist/react-datepicker.css"; // Import CSS for DatePicker
import "@/app/style/task_schedule.css";

const EventModal = ({ isOpen, event, onClose, onSave, onDelete }) => {
  if (!isOpen) return null;
  // console.log(`old start: `, event.start);
  // console.log(`old end: `, event.end);
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);

  // console.log(`start: `, startDate);
  // console.log(`end: `, endDate);
  const isAllDayEvent =
    event.startStr.split("T")[0] === event.endStr.split("T")[0] &&
    startDate.getHours() === 0 &&
    startDate.getMinutes() === 0 &&
    startDate.getSeconds() === 0 &&
    endDate.getHours() === 23 &&
    endDate.getMinutes() === 59 &&
    endDate.getSeconds() === 59;
  // console.log(`isOpen: ${isOpen}`);
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
          <strong>Start:</strong> {formatDate(startDate)}
        </p>
        <p>
          <strong>End:</strong> {formatDate(endDate)}
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

const formatDate = (date) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString(undefined, options);
};

const FullCalendarView = () => {
  //calendar
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  //task
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("priority");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showModal, setShowModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false); // State for Add Task Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskName, setTaskName] = useState(""); // State for task name
  const [description, setDescription] = useState(""); // State for description
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState(""); // State for status
  const [triggerEffect, setTriggerEffect] = useState(false);

  const router = useRouter();

  // Function to update tasks with query parameters
  const updateTasks = async () => {
    try {
      const params = {};

      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: params,
        }
      );

      setTasks(response.data);
      setFilteredTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    if (token) {
      updateTasks(); // Run on initial render
    }
  }, [token, searchTerm, priorityFilter, statusFilter, sortBy, sortOrder]);
  useEffect(() => {
    if (token && events) {
      console.log(`Updated events: ${JSON.stringify(events)}`); // Kiểm tra state sau khi thay đổi
    }
  }, [events]); // Lắng nghe sự thay đổi của `events`
  useEffect(() => {
    if (token) {
      updateEvents();
    }
  }, [tasks]); // Lắng nghe sự thay đổi của `events`
  useEffect(() => {
    if (token && triggerEffect) {
      updateTasks();
      setTriggerEffect(false);
    }
  }, [triggerEffect]); // Lắng nghe sự thay đổi của `events`

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === "priority") {
      setPriorityFilter(value);
    } else if (filterType === "status") {
      setStatusFilter(value);
    }
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleSortOrderChange = (order) => {
    setSortOrder(order);
  };

  const handleShowModal = (task) => {
    setSelectedTask(task);
    setTaskName(task.taskName);
    setDescription(task.description);
    setStartDate(new Date(task.startDate));
    setEndDate(new Date(task.endDate));
    setPriority(task.priority);
    setStatus(task.status); // Set status for editing
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false); //close edit modalmodal
    setShowAddTaskModal(false);
    setSelectedTask(null);
    setTaskName("");
    setDescription("");
    setStartDate(null);
    setEndDate(null);
    setPriority("");
    setStatus("");
  };

  const handleDeleteTask = async () => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${selectedTask._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTasks(tasks.filter((task) => task._id !== selectedTask._id));
      setFilteredTasks(
        filteredTasks.filter((task) => task._id !== selectedTask._id)
      );
      setShowDeleteModal(false); // Close the delete confirmation modal
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleShowDeleteModal = (task) => {
    setSelectedTask(task);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedTask(null);
  };

  const handleEditTask = async (eventTask) => {
    if (selectedTask) {
      try {
        console.log(`haha: `, selectedTask);
        const updatedTask = {
          ...selectedTask,
          taskName,
          description,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          priority,
          status, // Include status in the updated task
        };
        console.log(`huhu: `, updatedTask);

        await axios.patch(
          `${process.env.NEXT_PUBLIC_API_URL}/tasks/${selectedTask._id}`,
          updatedTask,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setTasks(
          tasks.map((task) =>
            task._id === selectedTask._id ? updatedTask : task
          )
        );
        setFilteredTasks(
          filteredTasks.map((task) =>
            task._id === selectedTask._id ? updatedTask : task
          )
        );

        handleCloseModal();
      } catch (error) {
        console.error("Error updating task:", error);
      }
    } else {
      console.log(`khong co selected task`);
      try {
        console.log(`haha: `, eventTask);
        console.log(`startDate: `, eventTask.startDate.toISOString());
        console.log(`endDate: `, eventTask.endDate);
        const updatedTask = {
          ...eventTask,
          taskName: eventTask.taskName,
          description: eventTask.description,
          startDate: `${eventTask.startDate.toISOString()}`,
          endDate: `${eventTask.endDate.toISOString()}`,
          priority: eventTask.priority,
          status: eventTask.status, // Include status in the updated task
        };
        console.log(`huhu: `, updatedTask);

        await axios.patch(
          `${process.env.NEXT_PUBLIC_API_URL}/tasks/${eventTask._id}`,
          updatedTask,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setTasks(
          tasks.map((task) => (task._id === eventTask._id ? eventTask : task))
        );
        setFilteredTasks(
          filteredTasks.map((task) =>
            task._id === eventTask._id ? eventTask : task
          )
        );

        handleCloseModal();
      } catch (error) {
        console.error("Error updating task:", error);
      }
    }
    setTriggerEffect(true);
  };

  const handleAddTask = async () => {
    if (!taskName) {
      alert("Please add Task Name!");
      return;
    } else if (!startDate) {
      alert("Please select Start Date!");
      return;
    } else if (!endDate) {
      alert("Please select End Date!");
      return;
    } else if (!priority) {
      alert("Please select a priority!");
      return;
    } else if (!status) {
      alert("Please select a status!");
      return;
    }
    // Đặt giờ theo múi giờ UTC
    let startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0); // Đặt giờ là 00:00:00
    let endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999); // Đặt giờ là 23:59:59
    // let allDay = false;
    // if (startDate.getTime() === endDate.getTime()) {
    //   allDay = true;
    // }

    try {
      // Tạo task instance
      const newTask = {
        taskName,
        description,
        startDate: startOfDay,
        endDate: endOfDay,
        priority,
        status,
      };
      console.log(`newTask: ${newTask}`);
      console.log("Task Name:", newTask.taskName);
      console.log("Description:", newTask.description);
      console.log("Start Date:", newTask.startDate);
      console.log("End Date:", newTask.endDate);
      console.log("Priority:", newTask.priority);
      console.log("Status:", newTask.status);

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, newTask, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowAddTaskModal(false); // Close modal after adding
      // Clear input fields
      setTaskName("");
      setDescription("");
      setStartDate(null);
      setEndDate(null);
      setPriority("");
      setStatus("");
      // Refresh tasks after adding
      updateTasks();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  //Calendar
  // Hàm lấy dữ liệu sự kiện từ API
  const updateEvents = async () => {
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

  const transformEventData = (data) => {
    return {
      id: data._id, // ID của sự kiện
      title: data.taskName, // Tiêu đề sự kiện
      start: new Date(data.startDate).toISOString(), // Chuyển startDate thành ISO String
      end: new Date(data.endDate).toISOString(), // Chuyển endDate thành ISO String
      description: data.description, // Mô tả sự kiện
      priority: data.priority, // Mức độ ưu tiên
      status: data.status,
      uid: data.uid,
      // allDay: allDay,
    };
  };
  const transformEventToTask = (data) => {
    return {
      _id: data.id, // ID của sự kiện
      taskName: data.title, // Tiêu đề sự kiện
      startDate: new Date(data.start), // Chuyển startDate thành ISO String
      endDate: new Date(data.end), // Chuyển endDate thành ISO String
      description: data.extendedProps.description, // Mô tả sự kiện
      priority: data.extendedProps.priority, // Mức độ ưu tiên
      status: data.extendedProps.status,
      uid: data.extendedProps.uid,
      // allDay: allDay,
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
    console.log(`clicked event: `, clickInfo);
    setIsModalOpen(true);
  };

  const handleEventDropAndResize = (info) => {
    console.log(`co chay drop`);
    const updatedEvents = events.map((event) =>
      event.id === info.event.id
        ? {
            ...event,
            start: info.event.start,
            end: info.event.end
              ? info.event.end
              : new Date(
                  info.event.start.getFullYear(),
                  info.event.start.getMonth(),
                  info.event.start.getDate() + 1
                ), // Thêm 1 ngày vào start
            allDay: info.event.allDay,
          }
        : event
    );
    setEvents(updatedEvents);
    const updatedTask = transformEventToTask(info.event);
    console.log(`transformed task: `, updatedTask);

    // Lấy thời gian hiện tại
    const now = new Date().toISOString();
    // Nếu thời gian start của task ở quá khứ, đổi trạng thái thành "Expired"
    if (new Date(updatedTask.startDate).toISOString() < now) {
      updatedTask.status = "Expired";
      console.log(`update transformed task: `, updatedTask);
    }

    handleEditTask(updatedTask);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Phần bên trái: Calendar */}
        <div className="col-lg-7 col-md-12 mb-3">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            editable={true}
            selectable={true}
            droppable={true}
            events={events}
            timeZone="local"
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventDrop={handleEventDropAndResize}
            eventResize={handleEventDropAndResize}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            eventContent={(arg) => (
              <div>
                <p>
                  <b>{arg.timeText}</b>
                </p>
                <p>
                  <b>{arg.event.title}</b>
                </p>
                <p>
                  <small>{arg.event.extendedProps.priority}</small>
                </p>
                <p>
                  <small>{arg.event.extendedProps.status}</small>
                </p>
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

        {/* Phần bên phải: Task List */}
        <div className="col-lg-5 col-md-12">
          <Container>
            <h5 className="my-3">Task List</h5>
            <Button
              size="sm"
              variant="success"
              onClick={() => setShowAddTaskModal(true)}
              className="mb-2"
            >
              Add Task
            </Button>
            <Form.Control
              size="sm"
              type="text"
              placeholder="Search tasks"
              value={searchTerm}
              onChange={handleSearch}
              className="mb-2"
            />
            <Row className="mb-2">
              <Col>
                <Form.Select
                  size="sm"
                  value={priorityFilter}
                  onChange={(e) =>
                    handleFilterChange("priority", e.target.value)
                  }
                >
                  <option value="">All Priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </Form.Select>
              </Col>
              <Col>
                <Form.Select
                  size="sm"
                  value={statusFilter}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Expired">Expired</option>
                </Form.Select>
              </Col>
              <Col>
                <Form.Select
                  size="sm"
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  <option value="priority">Sort by Priority</option>
                  <option value="status">Sort by Status</option>
                </Form.Select>
              </Col>
              <Col>
                <Form.Select
                  size="sm"
                  value={sortOrder}
                  onChange={(e) => handleSortOrderChange(e.target.value)}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </Form.Select>
              </Col>
            </Row>

            {/* Thanh cuộn cho danh sách task */}
            <div className="task-list-scroll">
              <Row>
                {filteredTasks.map((task) => (
                  <Col key={task._id} sm={12} className="mb-2">
                    <Card className="task-card">
                      <Card.Body>
                        <Card.Title className="task-title">
                          {task.taskName}
                        </Card.Title>
                        <Card.Text className="task-text">
                          <strong>Description:</strong> {task.description}
                        </Card.Text>
                        <Card.Text className="task-text">
                          <strong>Priority:</strong> {task.priority}
                        </Card.Text>
                        <Card.Text className="task-text">
                          <strong>Status:</strong> {task.status}
                        </Card.Text>
                        <Card.Text className="task-text">
                          <strong>Start Date:</strong>{" "}
                          {formatDate(task.startDate)}
                        </Card.Text>
                        <Card.Text className="task-text">
                          <strong>End Date:</strong> {formatDate(task.endDate)}
                        </Card.Text>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleShowModal(task)}
                        >
                          <FaEdit />
                        </Button>{" "}
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleShowDeleteModal(task)}
                        >
                          <FaTrashAlt />
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            {/* Add Task Modal */}
            <Modal show={showAddTaskModal} onHide={handleCloseModal}>
              <Modal.Header closeButton>
                <Modal.Title>Add New Task</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Task Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={taskName}
                      onChange={(e) => setTaskName(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Start Date</Form.Label>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      dateFormat="MMMM d, yyyy"
                      className="form-control"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>End Date</Form.Label>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      dateFormat="MMMM d, yyyy"
                      className="form-control"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Priority</Form.Label>
                    <Form.Select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="">Select Priority</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="">Select Status</option>
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Expired">Expired</option>
                    </Form.Select>
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Close
                </Button>
                <Button variant="success" onClick={handleAddTask}>
                  Add Task
                </Button>
              </Modal.Footer>
            </Modal>

            {/* Task Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal}>
              <Modal.Header closeButton>
                <Modal.Title>Edit Task</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {selectedTask && (
                  <div>
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label>Task Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={taskName} // Bind the input to taskName state
                          onChange={(e) => setTaskName(e.target.value)} // Update taskName when edited
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={description} // Bind the input to description state
                          onChange={(e) => setDescription(e.target.value)} // Update description when edited
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Start Date</Form.Label>
                        <DatePicker
                          selected={startDate}
                          onChange={(date) => setStartDate(date)}
                          dateFormat="MMMM d, yyyy"
                          className="form-control"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>End Date</Form.Label>
                        <DatePicker
                          selected={endDate}
                          onChange={(date) => setEndDate(date)}
                          dateFormat="MMMM d, yyyy"
                          className="form-control"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Priority</Form.Label>
                        <Form.Select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                          value={status} // Bind the input to status state
                          onChange={(e) => setStatus(e.target.value)} // Update status when edited
                        >
                          <option value="Todo">Todo</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Expired">Expired</option>
                        </Form.Select>
                      </Form.Group>
                    </Form>
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Close
                </Button>
                <Button variant="primary" onClick={handleEditTask}>
                  Save Changes
                </Button>
              </Modal.Footer>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
              <Modal.Header closeButton>
                <Modal.Title>Confirm Deletion</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Are you sure you want to delete this task?
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseDeleteModal}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleDeleteTask}>
                  Delete
                </Button>
              </Modal.Footer>
            </Modal>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default FullCalendarView;
