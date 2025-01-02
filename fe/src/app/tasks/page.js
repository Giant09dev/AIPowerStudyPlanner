"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Container,
  Row,
  Col,
  Form,
  Modal,
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { FaEdit, FaInfoCircle, FaTrashAlt } from "react-icons/fa"; // Import the icons
import DatePicker from "react-datepicker"; // Import the DatePicker component
import "react-datepicker/dist/react-datepicker.css"; // Import CSS for DatePicker

const TasksPage = () => {
  const { token } = useAuth();
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
    updateTasks(); // Run on initial render
  }, [token]);

  // Re-run updateTasks when any of the filter/search values change
  useEffect(() => {
    updateTasks();
  }, [searchTerm, priorityFilter, statusFilter, sortBy, sortOrder]);

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
    setShowModal(false);
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

  const handleEditTask = async () => {
    if (selectedTask) {
      try {
        const updatedTask = {
          ...selectedTask,
          taskName,
          description,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          priority,
          status, // Include status in the updated task
        };

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
    }
  };

  const handleAddTask = async () => {
    try {
      const newTask = {
        taskName,
        description,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        priority,
        status,
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, newTask, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh tasks after adding
      updateTasks();

      setShowAddTaskModal(false); // Close modal after adding
      // Clear input fields
      setTaskName("");
      setDescription("");
      setStartDate(null);
      setEndDate(null);
      setPriority("");
      setStatus("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const formatDate = (date) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  return (
    <Container>
      <h1 className="my-4">Task List</h1>

      {/* Add Task Button */}
      <Button
        variant="success"
        onClick={() => setShowAddTaskModal(true)} // Show Add Task Modal
        className="mb-3"
      >
        Add Task
      </Button>

      {/* Search */}
      <Form.Control
        type="text"
        placeholder="Search tasks"
        value={searchTerm}
        onChange={handleSearch}
        className="mb-3"
      />

      {/* Filters */}
      <Row className="mb-3">
        <Col>
          <Form.Select
            value={priorityFilter}
            onChange={(e) => handleFilterChange("priority", e.target.value)}
          >
            <option value="">Filter by Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </Form.Select>
        </Col>
        <Col>
          <Form.Select
            value={statusFilter}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">Filter by Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Expired">Expired</option>
          </Form.Select>
        </Col>
        <Col>
          <Form.Select value={sortBy} onChange={handleSortChange}>
            <option value="priority">Sort by Priority</option>
            <option value="status">Sort by Status</option>
          </Form.Select>
        </Col>
        <Col>
          <Form.Select
            value={sortOrder}
            onChange={(e) => handleSortOrderChange(e.target.value)}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Task List */}
      <Row>
        {filteredTasks.map((task) => (
          <Col key={task._id} sm={12} md={6} lg={4} className="mb-3">
            <Card>
              <Card.Body>
                <Card.Title>{task.taskName}</Card.Title>
                <Card.Text>
                  <strong>Description:</strong> {task.description}
                </Card.Text>
                <Card.Text>
                  <strong>Priority:</strong> {task.priority}
                </Card.Text>
                <Card.Text>
                  <strong>Status:</strong> {task.status}
                </Card.Text>
                <Card.Text>
                  <strong>Start Date:</strong> {formatDate(task.startDate)}
                </Card.Text>
                <Card.Text>
                  <strong>End Date:</strong> {formatDate(task.endDate)}
                </Card.Text>
                <Button
                  variant="primary"
                  onClick={() => handleShowModal(task)} // Show Edit Modal
                >
                  <FaEdit />
                </Button>{" "}
                <Button
                  variant="danger"
                  onClick={() => handleShowDeleteModal(task)} // Show Delete Confirmation Modal
                >
                  <FaTrashAlt />
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Add Task Modal */}
      <Modal show={showAddTaskModal} onHide={() => setShowAddTaskModal(false)}>
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
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Expired">Expired</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAddTaskModal(false)}
          >
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
                    <option value="Open">Open</option>
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
        <Modal.Body>Are you sure you want to delete this task?</Modal.Body>
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
  );
};

export default TasksPage;
