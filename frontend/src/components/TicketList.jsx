import React, { useEffect, useState, useContext } from "react";
import { fetchTickets, deleteTicket, createTicket, updateTicket } from "../utils/api.js";
import { AuthContext } from "../utils/authContext";
import TicketForm from "./TicketForm.jsx";
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Modal, Button } from 'react-bootstrap';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { Tooltip, TooltipProvider } from 'react-tooltip';

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
    const [ticketToDelete, setTicketToDelete] = useState(null);

    const loadTickets = async () => {
        setLoading(true);
        try {
            const fetchedTickets = await fetchTickets();
            setTickets(fetchedTickets);
        } catch (err) {
            console.error("Failed to fetch tickets:", err);
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
            console.error("Failed to delete ticket:", err);
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
            console.error("Error while saving ticket:", error);
            setTimeout(() => toast.error("Error saving ticket. Please try again."), 100);
        } finally {
            setShowEditModal(false);
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

    const getDotColor = (status) => {
        switch (status) {
            case 'Open':
                return 'green';
            case 'In Progress':
                return 'orange';
            case 'Closed':
                return 'gray';
            default:
                return '';
        }
    };

    if (loading) return (
        <div className="loader-wrapper">
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
        <div className="container mt-5 pb-5 main-div">
            <div className="new-ticket">
                <h2 className="text-center mb-2">
                    {user.role === "admin" ? "All Tickets" : "Create a New Ticket"}
                </h2>
                <TicketForm
                    selectedTicket={null}
                    onSave={handleSave}
                />
            </div>

            <div className="mt-4">
                {tickets.length === 0 ? (
                    <p className="text-center">No tickets available.</p>
                ) : (
                    <ul className="list-group">
                        <h3 className="d-flex justify-content-center">My Tickets</h3>
                        {tickets.map((ticket) => (
                            <li key={ticket.id}>
                                <div style={{ display: 'flex', alignItems: 'center', width: '75%' }}>
                                    <span
                                        style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            backgroundColor: getDotColor(ticket.status),
                                            marginRight: '8px',
                                            position: 'relative',
                                        }}
                                        data-tooltip-id={`tooltip-${ticket.id}`} // Link to the tooltip
                                        data-tooltip-content={ticket.status} // Tooltip content
                                    />

                                    <Tooltip id={`tooltip-${ticket.id}`} className="custom-tooltip" place="top" effect="solid">
                                        {ticket.status}
                                    </Tooltip>

                                    <strong>{ticket.title} -</strong>
                                    <span className={`severity badge-outline ms-2 ${getBadgeClass(ticket.severity.charAt(0).toUpperCase() + ticket.severity.slice(1))}`}>
                                        {ticket.severity.charAt(0).toUpperCase() + ticket.severity.slice(1)}
                                    </span>
                                </div>
                                <div>
                                    <button
                                        className="icon"
                                        onClick={() => handleEdit(ticket)}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="icon"
                                        onClick={() => {
                                            setTicketToDelete(ticket);
                                            setShowDeleteModal(true);
                                        }}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Edit Ticket Modal */}
            <Modal
                show={showEditModal}
                onHide={() => {
                    setShowEditModal(false);
                    setSelectedTicket(null);
                }}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Edit Ticket</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <TicketForm
                        selectedTicket={selectedTicket}
                        onSave={handleSave}
                    />
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <Button
                        variant="btn"
                        onClick={() => {
                            setShowEditModal(false);
                            setSelectedTicket(null);
                        }}
                    >
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete "{ticketToDelete ? ticketToDelete.title : ''}"?
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="btn"
                        onClick={() => setShowDeleteModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button className="btn-important" onClick={handleDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default TicketList;
