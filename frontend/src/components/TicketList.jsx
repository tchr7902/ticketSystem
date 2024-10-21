// src/pages/TicketPage.jsx
import React, { useEffect, useState, useContext } from "react";
import { fetchTickets } from "../utils/api";
import { AuthContext } from "../utils/authContext";
import TicketForm from "../components/TicketForm";

function TicketPage() {
    const { user } = useContext(AuthContext);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        loadTickets();
    }, []);

    if (loading) return <p>Loading tickets...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>{user.role === "admin" ? "All Tickets" : "Your Tickets"}</h2>
            <TicketForm onSave={loadTickets} />
            <ul>
                {tickets.map((ticket) => (
                    <li key={ticket.id}>
                        <strong>{ticket.title}</strong> - {ticket.status}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TicketPage;
