import React, { useEffect, useState } from "react";
import { fetchTickets, deleteTicket } from "../utils/api.js";

function TicketList({ onEdit }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);  // Track loading state
    const [error, setError] = useState(null);      // Track errors

    useEffect(() => {
        const loadTickets = async () => {
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
        loadTickets();
    }, []);

    const handleDelete = async (id) => {
        try {
            await deleteTicket(id);
            setTickets(tickets.filter((ticket) => ticket.id !== id));
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
