import React, { useEffect, useState, useContext } from "react";
import { fetchTickets, deleteTicket, createTicket, updateTicket, archiveTicket } from "../utils/api.js";
import { AuthContext } from "../utils/authContext";
import TicketForm from "./TicketForm.jsx";
import { Modal, Form } from 'react-bootstrap';
import { FaTrashAlt, FaArchive, FaPencilAlt, FaSpinner, FaRegFolderOpen, FaRegCheckCircle  } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Tooltip } from 'react-tooltip'
import { format } from 'date-fns';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function TicketList() {
    const { user, logout } = useContext(AuthContext);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [ticketToDelete, setTicketToDelete] = useState(null);
    const [ticketToArchive, setTicketToArchive] = useState(null);
    const [timeSpent, setTimeSpent] = useState("");
    const [partsNeeded, setPartsNeeded] = useState("");
    const [archiveNotes, setArchiveNotes] = useState("");
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTickets = tickets.filter(ticket => {
        const formattedDate = ticket.created_at 
            ? format(new Date(ticket.created_at), 'MM/dd/yyyy') 
            : '';
    
        return (
            (ticket.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ticket.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ticket.severity || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ticket.status || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ticket.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            formattedDate.includes(searchQuery.toLowerCase()) ||
            (ticket.phone_number || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const highSeverityTickets = tickets
    .filter(ticket => ticket.severity.toLowerCase() === 'high')
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const mediumSeverityTickets = tickets
    .filter(ticket => ticket.severity.toLowerCase() === 'medium')
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const lowSeverityTickets = tickets
    .filter(ticket => ticket.severity.toLowerCase() === 'low')
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const loadTickets = async () => {
        setLoading(true);
        try {
            const fetchedTickets = await fetchTickets();
            setTickets(fetchedTickets);
        } catch (err) {
            setError("Unable to load tickets.");
            logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTickets();
    }, []);
    

    const showToast = (message, type = "success") => {
        toast(message, { type });
    };

    const handleDelete = async () => {
        try {
            if (ticketToDelete) {
                await deleteTicket(ticketToDelete.id);
                setTickets(tickets.filter((ticket) => ticket.id !== ticketToDelete.id));
                setTicketToDelete(null);
                showToast("Ticket deleted successfully!", "success");
            }
        } catch (err) {
            showToast("Error deleting ticket. Please try again.", "error");
        } finally {
            setShowDeleteModal(false);
        }
    };

    const handleEdit = (ticket) => {
        setSelectedTicket(ticket);
        setShowEditModal(true);
    };

    const handleSave = async (ticketData) => {
        setLoading(true);
        try {
            if (selectedTicket) {
                await updateTicket(selectedTicket.id, ticketData);
                setTimeout(() => toast.success("Ticket updated successfully!"), 100);
            } else {
                await createTicket(ticketData);
                setTimeout(() => toast.success("Ticket created successfully!"), 100);
            }
            setSelectedTicket(null);
            await loadTickets();
        } catch (error) {
            setTimeout(() => toast.error("Error saving ticket. Please try again."), 100);
        } finally {
            setLoading(false);
            setShowEditModal(false);
        }
    };

    const openArchiveModal = (ticket) => {
        setTicketToArchive(ticket);
        setShowArchiveModal(true);
    };

    const handleArchiveConfirm = async () => {
        try {
            setLoading(true);
            if (ticketToArchive) {
                const combinedNotes = `
                    Time Spent: ${timeSpent}
                    Parts Needed: ${partsNeeded}
                    Additional Notes: ${archiveNotes}
                `;
                
                await archiveTicket(ticketToArchive.id, combinedNotes); 
                setTickets(tickets.filter((ticket) => ticket.id !== ticketToArchive.id));
                showToast("Ticket archived successfully!", "success");
            }
        } catch (error) {
            showToast("Error archiving ticket. Please try again.", "error");
        } finally {
            setLoading(false);
            setShowArchiveModal(false);
            setTimeSpent("");  
            setPartsNeeded("");  
            setArchiveNotes("");    
        }
    };
    

    const getBadgeClass = (severity) => {
        switch (severity) {
            case "Low":
                return "Low";
            case "Medium":
                return "Medium";
            case "High":
                return "High";
            default:
                return "";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Open':
                return <FaRegFolderOpen />;
            case 'In Progress':
                return <FaSpinner className="spin"/>;
            case 'Closed':
                return <FaRegCheckCircle />;
            default:
                return '';
        }
    };

    if (loading) return (
        <div className="loader-wrapper-3">
            <div className="lds-ellipsis">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    );
    if (error) return <div className="text-center mt-3"><p className="text-danger">{error}</p></div>;

    return (
        <div className="container mt-5 main-div">
            <div className="create-ticket-div">
            {user.role === "user" && (
                <div className="new-ticket">
                <h2 className="text-center mb-2">
                    {user.role === "admin" ? "New Ticket" : "New Ticket"}
                </h2>
                <TicketForm selectedTicket={null} onSave={handleSave} />
            </div>                          
            )}
            {user.role === "admin" && (
                <div className="new-ticket-admin">
                <h2 className="text-center mb-2">Search Tickets</h2>
                <div className="type-div">
                <input
                    type="text"
                    className="form-control input-box"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                </div>
            </div>                          
            )}
            </div>
            <h3 className="d-flex justify-content-center mt-5">{user.role === "admin" ? "All Tickets" : "My Tickets"}</h3>
            <div className="list-div">
                {tickets.length === 0 ? (
                    <p className="text-center">{user.role === "admin" ? "Congrats, you're caught up!" : "You don't have any tickets yet."}</p>
                ) : (
                    <div className="list-group">

                        {highSeverityTickets.length > 0 && (
                        <div className="high-sev-tickets">
                            {filteredTickets.filter(ticket => ticket.severity.toLowerCase() === 'high').map((ticket) => (
                            <li className="" key={ticket.id}>
                                <span className={`severity severity-banner ms-2
                                    ${getBadgeClass(ticket.severity.charAt(0).toUpperCase() + ticket.severity.slice(1))}`}
                                    data-tooltip-id="status-tooltip"
                                    data-tooltip-content={getBadgeClass(ticket.severity.charAt(0).toUpperCase() + ticket.severity.slice(1))}
                                    data-tooltip-offset={-15}
                                    data-tooltip-delay-show={300}>
                                </span>
                                    <span className="status-icon"
                                        data-tooltip-id="status-tooltip"
                                        data-tooltip-content={ticket.status}
                                        data-tooltip-delay-show={300}>
                                        {getStatusIcon(ticket.status)}
                                    </span>
                                <div className="title-div">
                                    <strong className="hide-text">{ticket.title}</strong>
                                </div>
                                <div className="icon-div">
                                    <button className="icon"
                                        onClick={() => handleEdit(ticket)}
                                        data-tooltip-id="edit-tooltip"
                                        data-tooltip-content="Edit"
                                        data-tooltip-delay-show={1000}>
                                        <FaPencilAlt />
                                    </button>
                                    <button className="icon"
                                        onClick={() => {
                                        setTicketToDelete(ticket);
                                        setShowDeleteModal(true);
                                        }}
                                        data-tooltip-id="delete-tooltip"
                                        data-tooltip-content="Delete"
                                        data-tooltip-delay-show={1000}>
                                        <FaTrashAlt />
                                    </button>
                                    {user.role === "admin" && (
                                        <button className="icon" onClick={() => openArchiveModal(ticket)}>
                                            <FaArchive />
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                        </div>
                        )}

                        {mediumSeverityTickets.length > 0 && (
                        <div className="medium-sev-tickets">
                        {filteredTickets.filter(ticket => ticket.severity.toLowerCase() === 'medium').map((ticket) => (
                            <li className="" key={ticket.id}>
                                <span className={`severity severity-banner ms-2
                                    ${getBadgeClass(ticket.severity.charAt(0).toUpperCase() + ticket.severity.slice(1))}`}
                                    data-tooltip-id="status-tooltip"
                                    data-tooltip-content={getBadgeClass(ticket.severity.charAt(0).toUpperCase() + ticket.severity.slice(1))}
                                    data-tooltip-offset={-15}
                                    data-tooltip-delay-show={300}>
                                </span>
                                    <span className="status-icon"
                                        data-tooltip-id="status-tooltip"
                                        data-tooltip-content={ticket.status}
                                        data-tooltip-delay-show={300}>
                                        {getStatusIcon(ticket.status)}
                                    </span>
                                <div className="title-div">
                                    <strong className="hide-text">{ticket.title}</strong>
                                </div>
                                <div className="icon-div">
                                    <button className="icon"
                                        onClick={() => handleEdit(ticket)}
                                        data-tooltip-id="edit-tooltip"
                                        data-tooltip-content="Edit"
                                        data-tooltip-delay-show={1000}>
                                        <FaPencilAlt />
                                    </button>
                                    
                                    <button className="icon"
                                        onClick={() => {
                                        setTicketToDelete(ticket);
                                        setShowDeleteModal(true);
                                        }}
                                        data-tooltip-id="delete-tooltip"
                                        data-tooltip-content="Delete"
                                        data-tooltip-delay-show={1000}>
                                        <FaTrashAlt />
                                    </button>
                                    {user.role === "admin" && (
                                        <button className="icon" onClick={() => openArchiveModal(ticket)}>
                                            <FaArchive />
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                        </div>
                        )}

                        {lowSeverityTickets.length > 0 && (
                        <div className="low-sev-tickets">
                        {filteredTickets.filter(ticket => ticket.severity.toLowerCase() === 'low').map((ticket) => (
                            <li className="" key={ticket.id}>
                                <span className={`severity severity-banner ms-2
                                    ${getBadgeClass(ticket.severity.charAt(0).toUpperCase() + ticket.severity.slice(1))}`}
                                    data-tooltip-id="status-tooltip"
                                    data-tooltip-content={getBadgeClass(ticket.severity.charAt(0).toUpperCase() + ticket.severity.slice(1))}
                                    data-tooltip-offset={-15}
                                    data-tooltip-delay-show={300}>
                                </span>
                                    <span className="status-icon"
                                        data-tooltip-id="status-tooltip"
                                        data-tooltip-content={ticket.status}
                                        data-tooltip-delay-show={300}>
                                        {getStatusIcon(ticket.status)}
                                    </span>
                                <div className="title-div">
                                    <strong className="hide-text">{ticket.title}</strong>
                                </div>
                                <div className="icon-div">
                                    <button className="icon"
                                        onClick={() => handleEdit(ticket)}
                                        data-tooltip-id="edit-tooltip"
                                        data-tooltip-content="Edit"
                                        data-tooltip-delay-show={1000}>
                                        <FaPencilAlt />
                                    </button>
                                    
                                    <button className="icon"
                                        onClick={() => {
                                        setTicketToDelete(ticket);
                                        setShowDeleteModal(true);
                                        }}
                                        data-tooltip-id="delete-tooltip"
                                        data-tooltip-content="Delete"
                                        data-tooltip-delay-show={1000}>
                                        <FaTrashAlt />
                                    </button>
                                    {user.role === "admin" && (
                                        <button className="icon" onClick={() => openArchiveModal(ticket)}>
                                            <FaArchive />
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                        </div>
                        )}
                    </div>
                    
                )}
            </div>

            <Tooltip id="status-tooltip" />
            <Tooltip id="edit-tooltip" />
            <Tooltip id="delete-tooltip" />
            <Tooltip id="severity-tooltip" />
             {/* Edit Ticket Modal */}
             <Modal
                show={showEditModal}
                onHide={() => {
                    setShowEditModal(false);
                    setSelectedTicket(null);
                }}
            >
                <Modal.Header closeButton>
                    <Modal.Title><h3 className="m-0">Edit Ticket</h3></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <TicketForm
                        selectedTicket={selectedTicket}
                        onSave={handleSave}
                    />
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <button
                        className="btn-2"
                        onClick={() => {
                            setShowEditModal(false);
                            setSelectedTicket(null);
                        }}
                    >
                        Cancel
                    </button>
                    <div className="edit-info">
                    <p>
                        Created on: {selectedTicket ? new Date(selectedTicket.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                    <p>
                        by {selectedTicket ? selectedTicket.name : 'N/A'}
                    </p>
                    </div>
                </Modal.Footer>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title><h3 className="m-0">Confirm Deletion</h3></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete "{ticketToDelete ? ticketToDelete.title : ''}"? This cannot be undone!
                </Modal.Body>
                <Modal.Footer>
                    <button
                        className="btn-2"
                        onClick={() => setShowDeleteModal(false)}
                    >
                        Cancel
                    </button>
                    <button className="btn-important" onClick={handleDelete}>
                        Delete
                    </button>
                </Modal.Footer>
            </Modal>

            {/* Archive Modal */}
            <Modal show={showArchiveModal} onHide={() => setShowArchiveModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title><h3 className="m-0">Confirm Archive</h3></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to archive "{ticketToArchive ? ticketToArchive.title : ''}"?
                </Modal.Body>
                <Modal.Body>
                    <Form>
                    <Form.Group controlId="archiveNotes">
                        <Form.Control
                            className="input-box"
                            as="textarea"
                            rows={1}
                            value={timeSpent}  // Manage separate states for each field
                            onChange={(e) => setTimeSpent(e.target.value)}
                            placeholder="Time Spent"
                        />
                        
                        <Form.Control
                            className="input-box"
                            as="textarea"
                            rows={1}
                            value={partsNeeded}  // Manage separate states for each field
                            onChange={(e) => setPartsNeeded(e.target.value)}
                            placeholder="Parts Needed"
                        />

                        <Form.Control
                            className="input-box"
                            as="textarea"
                            rows={3}
                            value={archiveNotes}  // Combined field for all notes
                            onChange={(e) => setArchiveNotes(e.target.value)}
                            placeholder="Additional Notes"
                        />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn-2" onClick={() => setShowArchiveModal(false)}>
                        Cancel
                    </button>
                    <button className="btn-important" onClick={handleArchiveConfirm}>
                        Archive
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default TicketList;
