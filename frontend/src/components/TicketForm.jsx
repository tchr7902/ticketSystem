import React, { useState, useEffect } from "react";
import { createTicket, updateTicket } from "../utils/api.js";

function TicketForm({ selectedTicket, onSave }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("open");

    // Effect to populate form fields when a ticket is selected for editing
    useEffect(() => {
        if (selectedTicket) {
            setTitle(selectedTicket.title);
            setDescription(selectedTicket.description);
            setStatus(selectedTicket.status);
        } else {
            // Reset form fields if no selected ticket
            setTitle("");
            setDescription("");
            setStatus("open");
        }
    }, [selectedTicket]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const ticketData = { title, description, status };

        try {
            // Create or update the ticket based on whether one is selected
            if (selectedTicket) {
                await updateTicket(selectedTicket.id, ticketData);
            } else {
                await createTicket(ticketData);
            }
            // Trigger the onSave callback to reload tickets
            onSave();
        } catch (error) {
            console.error("Error while submitting ticket:", error);
        } finally {
            // Clear input fields after submission
            setTitle("");
            setDescription("");
            setStatus("open");
        }
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
