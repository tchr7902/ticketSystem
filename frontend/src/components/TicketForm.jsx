import React, { useState, useEffect } from "react";
import { createTicket, updateTicket } from "../utils/api.js";
import 'bootstrap/dist/css/bootstrap.min.css';

function TicketForm({ selectedTicket, onSave }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [severity, setSeverity] = useState("");

    useEffect(() => {
        if (selectedTicket) {
            setTitle(selectedTicket.title);
            setDescription(selectedTicket.description);
            setSeverity(selectedTicket.severity);
        } else {
            setTitle("");
            setDescription("");
            setSeverity("");
        }
    }, [selectedTicket]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const ticketData = { title, description, severity };

        // Call the onSave prop to create or update a ticket
        onSave(ticketData); 
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4">
            <div className="d-flex flex-column align-items-center">
                <div className="col-md-6 col-lg-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
            </div>
            <div className="d-flex flex-column align-items-center">
                <div className="col-md-6 col-lg-4">
                    <textarea
                        className="form-control"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
            </div>
            <div className="d-flex flex-column align-items-center">
                <div className="col-md-6 col-lg-4">
                    <select 
                        className="form-select" 
                        value={severity} 
                        onChange={(e) => setSeverity(e.target.value)}
                        required
                    >
                        <option value="" disabled>Select Priority</option> {/* Placeholder */}
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>
            </div>
            <div className="d-flex justify-content-center">
                <div> {/* Responsive size for button */}
                    <button type="submit" className="btn btn-primary">Save</button>
                </div>
            </div>
        </form>
    );
}

export default TicketForm;
