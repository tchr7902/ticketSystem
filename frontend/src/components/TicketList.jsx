import React, { useEffect, useState } from "react";
import { fetchTickets, deleteTicket } from "../utils/api.js";

export function TicketList({ onEdit, loadTickets }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);  // Track loading state
    const [error, setError] = useState(null);      // Track errors

    // Load tickets function
    const loadTicketsInternal = async () => {
        setLoading(true); // Set loading state before fetching
        try {
            const fetchedTickets = await fetchTickets();
            setTickets(fetchedTickets);
        } catch (err) {
            console.error("Failed to fetch tickets:", err);
            setError("Unable to load tickets.");
        } finally {
            setLoading(false);  // Hide loader after fetch
        }
    };

    useEffect(() => {
        loadTicketsInternal(); // Load tickets on component mount
    }, []);

    const handleDelete = async (id) => {
        try {
            await deleteTicket(id);
            // Remove the deleted ticket from the state
            setTickets(tickets.filter((ticket) => ticket.id !== id));
            // Optionally reload tickets
            await loadTickets(); // Call loadTickets to refresh after deletion
        } catch (err) {
            console.error("Failed to delete ticket:", err);
            alert("Error deleting ticket. Please try again.");
        }
    };

    if (loading) return <p>Loading tickets...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>Tickets</h2>
            <ul>
                {tickets.length === 0 ? (
                    <p>No tickets available.</p>
                ) : (
                    tickets.map((ticket) => (
                        <li key={ticket.id}>
                            <strong>{ticket.title}</strong> - {ticket.status}
                            <button onClick={() => onEdit(ticket)}>Edit</button>
                            <button onClick={() => handleDelete(ticket.id)}>Delete</button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}

export default TicketList;
