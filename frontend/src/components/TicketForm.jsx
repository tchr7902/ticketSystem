import React, { useState, useEffect } from "react";
import { useAuth } from "../utils/authContext";
import 'bootstrap/dist/css/bootstrap.min.css';

function TicketForm({ selectedTicket, onSave }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [severity, setSeverity] = useState("");
    const [status, setStatus] = useState("Open");  // Default to 'Open' if creating a new ticket
    const [contactMethod, setContactMethod] = useState(""); // State for contact method
    const { user } = useAuth();  // Get user context

    // Populate form with ticket data if editing an existing ticket
    useEffect(() => {
        if (selectedTicket) {
            setTitle(selectedTicket.title);
            setDescription(selectedTicket.description);
            setSeverity(selectedTicket.severity);
            setStatus(selectedTicket.status);
            setContactMethod(selectedTicket.contact_method || ""); // Set contact method correctly
        } else {
            // Clear form if no ticket is selected (creating a new one)
            setTitle("");
            setDescription("");
            setSeverity("");
            setStatus("Open");
            setContactMethod(""); 
        }
    }, [selectedTicket]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const ticketData = { 
            title, 
            description, 
            severity, 
            status, 
            contact_method: contactMethod 
        };
        onSave(ticketData); // Call the save function with ticket data
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4">
            <div className="d-flex flex-column align-items-center">
                <div className="col-md-8 col-lg-9">
                    <input
                        type="text"
                        className="form-control input-box"
                        placeholder="Issue"
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
                <div className="col-md-8 col-lg-6">
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
                <div className="col-md-8 col-lg-6 contact">
                    <select 
                        className="form-select select-box" 
                        value={contactMethod} 
                        onChange={(e) => setContactMethod(e.target.value)}
                        required
                    >
                        <option value="" disabled>Contact Method</option>
                        {/* Preserve the original contact method if it exists */}
                        {selectedTicket && selectedTicket.contact_method && (
                            <option value={selectedTicket.contact_method}>
                                {selectedTicket.contact_method}
                            </option>
                        )}
                        {/* Display the current user's info if creating a new ticket */}
                        {!selectedTicket && (
                            <>
                                <option value={user?.email}>{user?.email}</option>
                                <option value={user?.phone_number}>{user?.phone_number}</option>
                            </>
                        )}
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
                    <button type="submit" className="btn-important ticket-save">Submit</button>
                </div>
            </div>
        </form>
    );
}

export default TicketForm;
