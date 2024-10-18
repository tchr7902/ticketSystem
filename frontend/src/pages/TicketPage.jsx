import React, { useState, useEffect } from "react";
import TicketList from "../components/TicketList.jsx";
import TicketForm from "../components/TicketForm.jsx";
import { fetchTickets } from "../utils/api.js";

function TicketPage() {
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const loadTickets = async () => {
        try {
            const fetchedTickets = await fetchTickets();
            setTickets(fetchedTickets);
        } catch (error) {
            console.error("Failed to load tickets:", error);
        }
    };

    useEffect(() => {
        loadTickets(); // Load tickets on initial render
    }, []);

    const handleEdit = (ticket) => {
        setSelectedTicket(ticket); // Set the selected ticket for editing
    };

    const handleSave = async () => {
        setSelectedTicket(null); // Deselect the ticket after saving
        await loadTickets(); // Reload tickets after save
    };

    return (
        <div>
            <h1>Ticketing System</h1>
            <TicketForm 
                selectedTicket={selectedTicket} 
                onSave={handleSave} // Simplify the onSave to just handleSave
            />
            <TicketList tickets={tickets} onEdit={handleEdit} />
        </div>
    );
}

export default TicketPage;
