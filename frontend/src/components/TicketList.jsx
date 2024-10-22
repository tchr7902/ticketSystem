import React, { useEffect, useState, useContext } from "react";
import { fetchTickets, deleteTicket, createTicket, updateTicket } from "../utils/api.js";
import { AuthContext } from "../utils/authContext";
import TicketForm from "./TicketForm.jsx";
import '../styles/App.css'
import 'bootstrap/dist/css/bootstrap.min.css';

function TicketList() {
    const { user, logout } = useContext(AuthContext);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);

    // Load tickets function
    const loadTickets = async () => {
        setLoading(true); // Set loading state before fetching
        try {
            const fetchedTickets = await fetchTickets();
            setTickets(fetchedTickets);
        } catch (err) {
            console.error("Failed to fetch tickets:", err);
            setError("Unable to load tickets.");
            logout();
        } finally {
            setLoading(false);  // Hide loader after fetch
        }
    };

    useEffect(() => {
        loadTickets(); // Load tickets on component mount
    }, []);

    const handleDelete = async (id) => {
        try {
            await deleteTicket(id);
            // Remove the deleted ticket from the state
            setTickets(tickets.filter((ticket) => ticket.id !== id));
        } catch (err) {
            console.error("Failed to delete ticket:", err);
            alert("Error deleting ticket. Please try again.");
        }
    };

    const handleEdit = (ticket) => {
        setSelectedTicket(ticket); // Set selected ticket for editing
    };

    const handleSave = async (ticketData) => {
        try {
            if (selectedTicket) {
                await updateTicket(selectedTicket.id, ticketData);
            } else {
                await createTicket(ticketData);
            }
            setSelectedTicket(null); // Reset selection after save
            await loadTickets(); // Reload tickets after saving
        } catch (error) {
            console.error("Error while saving ticket:", error);
        }
    };

    const getBadgeClass = (severity) => {
        switch (severity) {
            case "low":
                return "bg-success"; // Green for low severity
            case "medium":
                return "bg-warning"; // Yellow for medium severity
            case "high":
                return "bg-danger"; // Red for high severity
            default:
                return "bg-secondary"; // Default color
        }
    };

    if (loading) return <div className="text-center mt-3"><p>Loading tickets...</p></div>;
    if (error) return <div className="text-center mt-3"><p className="text-danger">{error}</p></div>;

    return (
        <div className="container mt-5 pb-5">
            <div className="new-ticket">
            <h2 className="text-center mb-2">
                {user.role === "admin" ? "All Tickets" : "Create a New Ticket"}
            </h2>
            <TicketForm 
                selectedTicket={selectedTicket} 
                onSave={handleSave} // Pass handleSave to TicketForm
            />
            </div>
            <div className="mt-4">
                {tickets.length === 0 ? (
                    <p className="text-center">No tickets available.</p>
                ) : (
                    <ul className="list-group">
                        <li className="li-header d-flex justify-content-center align-items-center">Your Tickets</li>
                        {tickets.map((ticket) => (
                            <li 
                                key={ticket.id} 
                                className="list-group-item d-flex justify-content-between align-items-center"
                            >
                                <div>
                                    <strong>{ticket.title}</strong> - 
                                    <span className={`severity badge ms-2 ${getBadgeClass(ticket.severity)}`}>
                                        {ticket.severity}
                                    </span>
                                </div>
                                <div>
                                    <button 
                                        className="btn btn-warning btn-sm me-2" 
                                        onClick={() => handleEdit(ticket)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="btn btn-danger btn-sm" 
                                        onClick={() => handleDelete(ticket.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default TicketList;
