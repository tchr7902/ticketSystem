import React, { useState, useEffect } from "react";
import { useAuth } from "../utils/authContext";
import 'bootstrap/dist/css/bootstrap.min.css';

function TicketForm({ selectedTicket, onSave }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [severity, setSeverity] = useState("");
    const [status, setStatus] = useState("");
    const { user } = useAuth();

    useEffect(() => {
        if (selectedTicket) {
            setTitle(selectedTicket.title);
            setDescription(selectedTicket.description);
            setSeverity(selectedTicket.severity);
            setStatus(selectedTicket.status);
        } else {
            setTitle("");
            setDescription("");
            setSeverity("");
            setStatus("Open");
        }
    }, [selectedTicket]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const ticketData = { title, description, severity, status };
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
            <div className="d-flex flex-column align-items-center">
                {user?.role === 'admin' && (
                    <div className="col-md-8 col-lg-4">
                        <select 
                            className="form-select select-box" 
                            value={status} 
                            onChange={(e) => setStatus(e.target.value)}
                            required
                        >
                            <option value="" disabled>Select Status</option>
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>
                )}
                {user?.role !== 'admin' && (
                    <div className="col-md-8 col-lg-4">
                        <input
                            type="text"
                            className="form-control static-status"
                            value="Status - Open"
                            readOnly
                        />
                    </div>
                )}
            </div>
            <div className="d-flex justify-content-center">
                <div>
                    <button type="submit" className="btn-important ticket-save">Save</button>
                </div>
            </div>
        </form>
    );
}

export default TicketForm;
