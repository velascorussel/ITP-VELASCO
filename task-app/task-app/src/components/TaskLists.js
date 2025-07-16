import React, { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext'
import { Badge, Button, ButtonGroup, Card, Col, Container, Form, Modal, Row } from 'react-bootstrap';
import { CheckCircleFill, PencilSquare, PlusCircle, Textarea, TrashFill } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';






export default function TaskLists() {

    const {user} = useAuth();
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState("");
    const [newTask, setNewTask] = useState({taskName: "", taskDescription: ""});
    const [selectedTask, setSelectedTask] = useState({task_id: "", taskName: ""});

    console.log(selectedTask)


    // Modal useState for Adding Task
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // Modal for Delete Confirmation
    const [showDelete, setShowDelete] = useState(false);
    const handleCloseDelete = () => setShowDelete(false);
    const handleShowDelete = () => setShowDelete(true);

    // Modal for Task Completion Confirmation
    const [showCompleted, setShowCompleted] = useState(false);
    const handleCloseCompleted = () => setShowCompleted(false);
    const handleShowCompleted = () => setShowCompleted(true);

    function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const timePart = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
    return `${datePart} at ${timePart}`;
    }

    const fetchTasks = () => {
        if(!user) return;

        fetch(`http://localhost:4000/tasks/all/${user.user_id}`)
        .then(res => res.json())
        .then(data => {
            if(data.code === 1 && Array.isArray(data.details)){
                setTasks(data.details);
                setError("");
            }else if(data.code === 2){
                setTasks([]);
                setError(data.details);
            }else{
                setTasks([]);
                setError(data.details);
            }
        })
    }

    const AddTask = (e) => {
        console.log("Addtask");
        e.preventDefault();

        if(!user) return;

        fetch("http://localhost:4000/tasks/create", {
            method: "POST",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({
                ...newTask,
                isActive: 1,
                taskCreated: new Date(),
                user_id: user.user_id
            })
        })
        .then(res => res.json())
        .then(data => {
            if(data.code === 1){
                Swal.fire({
                    icon: "success",
                    title: "Task Added!",
                    text: data.details
                })
                fetchTasks();
                handleClose();
                setNewTask({taskName: "", taskDescription: ""});
            }else{
                Swal.fire({
                    icon: "error",
                    title: "Oops!",
                    text: data.details
                })
            }
        })
    }

    const deleteTask = (task_id) => {
        if(!user) return;

        fetch(`http://localhost:4000/tasks/delete/${user.user_id}/${task_id}`, {
            method: "DELETE"
        })
        .then(res => res.json())
        .then(data => {
            console.log(task_id)
            if(data.code === 1){
                Swal.fire({
                    icon: "success",
                    title: "Task Deleted!",
                    text: data.details
                })

                fetchTasks();
                handleCloseDelete();
            }else{
                Swal.fire({
                    icon: "error",
                    title: "Task Cannot Be Deleted!",
                    text: data.details
                })
            }
        })
    }

    const taskCompleted = (task_id) => {
        if(!user) return;

        fetch(`http://localhost:4000/tasks/complete/${user.user_id}/${task_id}`, {
            method: "PUT"
        })
        .then(res => res.json())
        .then(data => {
            if(data.code === 1){
                Swal.fire({
                    icon: "success",
                    title: "Task Completed!",
                    text: data.details
                })
                fetchTasks();
                handleCloseCompleted();
            }else{
                Swal.fire({
                    icon: "error",
                    title: "Oops!",
                    text: data.details
                })
            }
        })
    }

    useEffect(() => {
        fetchTasks();
    }, [user])


  return (
   <>
   <Container fluid className='d-flex justify-content-end align-items-center m-2'>
        <Button className='btn-warning p-3 px-5 d-flex justify-content-center align-items-center rounded-pill' onClick={handleShow}>
        <PlusCircle className="me-2" size={25}/>
        Add Task
        </Button>
   </Container>

   {/* MODAL FOR ADD TASK */}
   <Modal show={show} onHide={handleClose} centered size='lg'>
        <Modal.Header closeButton className='bg-warning p-4'>
          <Modal.Title>Add a new task?</Modal.Title>
        </Modal.Header>

        <Form className='p-1 p-lg-3' onSubmit={AddTask}>
            <Modal.Body className='p-3'>
                
                    {/* Task Name Input Field */}
                    <Form.Group className="mb-3">
                        <Form.Control 
                            type="text" 
                            placeholder="Task Name" 
                            required
                            onChange={e => setNewTask({...newTask, taskName: e.target.value})}
                            value={newTask.taskName}
                        />
                    </Form.Group>

                    {/* Task Description Input Field */}
                    <Form.Group className="mb-3">
                        <Form.Control 
                            type="text" 
                            placeholder="Task Description" 
                            required 
                            as="textarea" 
                            rows={5}
                            onChange={e => setNewTask({...newTask, taskDescription: e.target.value})}
                            value={newTask.taskDescription}
                        />
                    </Form.Group>
                
            </Modal.Body>

            <Modal.Footer>
            <Button type='submit' variant="success" className='px-5 rounded-pill p-2'>
                Add
            </Button>
            </Modal.Footer>
        </Form>
    </Modal>
    {/* MODAL FOR ADD TASK */}
   

    <Row xs={1} md={2} lg={3} className='my-3'>
        {
            tasks.map(task => (
                <>
                <Col key={task.task_id} className='my-2'>
                    <Card className='h-100 shadow border rounded-4 p-1 p-lg-3'>
                        <Card.Body>
                            <Card.Title>
                                <h3 className='fw-bold text-primary-emphasis my-3'>{task.taskName}</h3>
                                {
                                    task.isActive ?
                                    <Badge className='bg-warning p-2 '>Pending</Badge>
                                    :
                                    <Badge className='bg-secondary p-2'>Done</Badge>
                                }
                            </Card.Title>
                            <Card.Text>
                                {task.taskDescription}
                            </Card.Text>
                        </Card.Body>
                        <Card.Footer>
                            <p className='fw-bold'>Added: {formatDate(task.taskCreated)}</p>
                            <p className='fw-bold'>Completed: {formatDate(task.taskCompleted)}</p>

                            <ButtonGroup size='lg'>
                                <Button variant="primary"><PencilSquare/></Button>
                                
                                <Button 
                                variant="danger" 
                                onClick={() => {
                                    handleShowDelete();
                                    setSelectedTask(task ? task : null);
                                    }}>
                                <TrashFill/>
                                </Button>
                                
                                {
                                    task.isActive ?
                                    <Button variant="success" onClick={() => {
                                    handleShowCompleted();
                                    setSelectedTask(task ? task : null);
                                    }}>
                                    <CheckCircleFill/>
                                    </Button>
                                    :
                                    <Button className='d-none' variant="success" onClick={() => {
                                    handleShowCompleted();
                                    setSelectedTask(task ? task : null);
                                    }}>
                                    <CheckCircleFill/>
                                    </Button>
                                }
                                
                            </ButtonGroup>
                        </Card.Footer>
                    </Card>
                </Col>

                {/* MODAL FOR DELETE CONFIRMATION */}
                <Modal show={showDelete} onHide={handleCloseDelete} centered size='lg'>
                <Modal.Header closeButton className='bg-warning p-4'>
                <Modal.Title>Please Confirm!</Modal.Title>
                </Modal.Header>

                    <Modal.Body className='p-3 text-center'>
                        <h4 className='fw-bold'>
                        Are you sure you want to delete <span className='text-primary'>{selectedTask.taskName.toUpperCase()}</span>?
                        </h4>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button type='submit' variant="secondary" className='px-5 rounded-pill p-2' onClick={handleCloseDelete}>
                            No
                        </Button>
                        <Button type='submit' variant="danger" className='px-5 rounded-pill p-2' onClick={() => deleteTask(selectedTask.task_id)}>
                            Yes
                        </Button>
                    </Modal.Footer>
            </Modal>
            {/* MODAL FOR DELETE CONFIRMATION */}

            {/* MODAL FOR TASK COMPLETION */}
            <Modal show={showCompleted} onHide={handleCloseCompleted} centered size='lg'>
                <Modal.Header closeButton className='bg-warning p-4'>
                <Modal.Title>Mark as done?</Modal.Title>
                </Modal.Header>

                    <Modal.Body className='p-3 text-center'>
                        <h4 className='fw-bold'>
                        Are you sure you want to mark <span className='text-primary'>{selectedTask.taskName.toUpperCase()}</span> as done?
                        </h4>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button type='submit' variant="secondary" className='px-5 rounded-pill p-2' onClick={handleCloseCompleted}>
                            No
                        </Button>
                        <Button type='submit' variant="danger" className='px-5 rounded-pill p-2' onClick={() => taskCompleted(selectedTask.task_id)}>
                            Yes
                        </Button>
                    </Modal.Footer>
            </Modal>
            {/* MODAL FOR TASK COMPLETION */}
                </>
            ))
        }
    </Row>
   </>
  )
}
