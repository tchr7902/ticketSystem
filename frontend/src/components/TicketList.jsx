import React, { useEffect, useState } from "react";
import { fetchTickets, createTicket, updateTicket, deleteTicket } from "../utils/api.js";
import TicketForm from "./TicketForm.jsx"; // Import TicketForm

export function TicketList() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null); // Manage selected ticket for editing

    // Load tickets function
    const loadTickets = async () => {
        setLoading(true);
        try {
            const fetchedTickets = await fetchTickets();
            setTickets(fetchedTickets);
        } catch (err) {
            console.error("Failed to fetch tickets:", err);
            setError("Unable to load tickets.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTickets(); // Load tickets on component mount
    }, []);

    const handleDelete = async (id) => {
        try {
            await deleteTicket(id);
            await loadTickets(); // Reload tickets after deletion
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

    if (loading) return <p>Loading tickets...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>Tickets</h2>
            <TicketForm 
                selectedTicket={selectedTicket} 
                onSave={handleSave} // Pass handleSave to TicketForm
            />
            <ul>
                {tickets.length === 0 ? (
                    <p>No tickets available.</p>
                ) : (
                    tickets.map((ticket) => (
                        <li key={ticket.id}>
                            <strong>{ticket.title}</strong> - {ticket.status}
                            <button onClick={() => handleEdit(ticket)}>Edit</button>
                            <button onClick={() => handleDelete(ticket.id)}>Delete</button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}

export default TicketList;
