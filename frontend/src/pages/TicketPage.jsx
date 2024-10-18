import React, { useState } from "react";
import TicketList from "../components/TicketList.jsx";
import TicketForm from "../components/TicketForm.jsx";

function TicketPage() {
    const [selectedTicket, setSelectedTicket] = useState(null);

    const handleEdit = (ticket) => setSelectedTicket(ticket);
    const handleSave = () => setSelectedTicket(null);

    return (
        <div>
            <h1>Ticketing System</h1>
            <TicketForm selectedTicket={selectedTicket} onSave={handleSave} />
            <TicketList onEdit={handleEdit} />
        </div>
    );
}

export default TicketPage;