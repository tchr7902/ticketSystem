import React, { useState, useEffect } from "react";
import { useAuth } from "../utils/authContext";
import 'bootstrap/dist/css/bootstrap.min.css';

function TicketForm({ selectedTicket, onSave }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [severity, setSeverity] = useState("");
    const [status, setStatus] = useState("Open");
    const [contactMethod, setContactMethod] = useState(""); 
    const { user } = useAuth(); 

    // Populate form with ticket data if editing an existing ticket
    useEffect(() => {
        if (selectedTicket) {
            setTitle(selectedTicket.title);
            setDescription(selectedTicket.description);
            setSeverity(selectedTicket.severity);
            setStatus(selectedTicket.status);
            setContactMethod(selectedTicket.contact_method || "");
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
        onSave(ticketData);
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4">
            <div className="form-box d-flex flex-column align-items-center">
                <div className="type-div">
                    <input
                        type="text"
                        className="form-control input-box"
                        placeholder="Issue"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={20}
                        required
                    />
                </div>
            </div>
            
            <div className="form-box d-flex flex-column align-items-center">
                <div className="type-div">
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

            <div className="input-form-box d-flex flex-column align-items-center">
                <div className="input-div">
                    <select 
                        className="form-select form-select-boxes select-box" 
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

            <div className="input-form-box d-flex flex-column align-items-center">
                <div className="input-div">
                    <select 
                        className="form-select form-select-boxes select-box" 
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
                                <option value={`${user?.phone_number} - Call`}>{user?.phone_number} - Call</option>
                                <option value={`${user?.phone_number} - Text`}>{user?.phone_number} - Text</option>
                                <option value="Google Chats">Google Chats</option>
                                <option value="Store">Store</option>
                            </>
                        )}
                    </select>
                </div>
            </div>

            <div className="input-form-box d-flex flex-column align-items-center">
                {user?.role === 'admin' && (
                    <div className="col-md-8 col-lg-4">
                        <select 
                            className="form-select form-select-boxes select-box" 
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
                    <div className="input-form-box col-md-8 col-lg-4">
                        <input
                            type="text"
                            className="form-control form-select-boxes static-status"
                            value={`${status}`}
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
