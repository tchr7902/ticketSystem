import React, { useState, useEffect } from "react";
import { createTicket, updateTicket } from "../utils/api.js";

function TicketForm({ selectedTicket, onSave }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("open");

    useEffect(() => {
        if (selectedTicket) {
            setTitle(selectedTicket.title);
            setDescription(selectedTicket.description);
            setStatus(selectedTicket.status);
        } else {
            setTitle("");
            setDescription("");
            setStatus("open");
        }
    }, [selectedTicket]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const ticketData = { title, description, status };

        // Call the onSave prop to create or update a ticket
        onSave(ticketData); 
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
            </select>
            <button type="submit">Save</button>
        </form>
    );
}

export default TicketForm;
