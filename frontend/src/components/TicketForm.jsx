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
            setSeverity(selectedTicket.severity.toLowerCase());
        } else {
            setTitle("");
            setDescription("");
            setSeverity("");
        }
    }, [selectedTicket]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const ticketData = { title, description, severity };
        onSave(ticketData); 
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4">
            <div className="d-flex flex-column align-items-center">
                <div className="col-md-8 col-lg-9">
                    <input
                        type="text"
                        className="form-control input-box"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
            </div>
            <div className="d-flex flex-column align-items-center">
                <div className="col-md-8 col-lg-9">
                    <textarea
                        className="form-control input-box"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        style={{ height: "100px" }}
                    />
                </div>
            </div>
            <div className="d-flex flex-column align-items-center">
                <div className="col-md-8 col-lg-4">
                    <select 
                        className="form-select select-box" 
                        value={severity} 
                        onChange={(e) => setSeverity(e.target.value)}
                        required
                    >
                        <option value="" disabled>Select Priority</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>
            </div>
            <div className="d-flex justify-content-center">
                <div>
                    <button type="submit" className="btn-important">Save</button>
                </div>
            </div>
        </form>
    );
}

export default TicketForm;
