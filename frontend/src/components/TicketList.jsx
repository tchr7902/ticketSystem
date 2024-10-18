import React, { useEffect, useState } from "react";
import { fetchTickets, deleteTicket } from "../utils/api.js"

function TicketList({ onEdit }) {
    const [tickets, setTickets] = useState([]);

    useEffect(() => {
        fetchTickets().then(setTickets);
    }, []);

    const handleDelete = async (id) => {
        await deleteTicket(id);
        setTickets(tickets.filter(ticket => ticket.id !== id));
    };

    return (
        <div>
            <h2>Tickets</h2>
            <ul>
                {tickets.map((ticket) => (
                    <li key={ticket.id}>
                        <strong>{ticket.title}</strong> - {ticket.status}
                        <button onClick={() => onEdit(ticket)}>Edit</button>
                        <button onClick={() => handleDelete(ticket.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default TicketList;