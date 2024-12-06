import React, { useState, useEffect } from "react";
import { useAuth } from "../utils/authContext";
import { uploadImage } from "../utils/api";
import 'bootstrap/dist/css/bootstrap.min.css';

function TicketForm({ selectedTicket, onSave }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [severity, setSeverity] = useState("");
    const [status, setStatus] = useState("Open");
    const [contactMethod, setContactMethod] = useState(""); 
    const [notes, setNotes] = useState("");
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState(null); 
    const { user } = useAuth(); 

    const handleImageChange = async (e) => {
        const file = e.target.files[0]; 
        if (file) {
            setImage(file); 
    
            try {
                const response = await uploadImage(file);
                const { image_url } = response; 
                
                setImageUrl(image_url);
                console.log("Signed URL:", image_url); 
            } catch (error) {
                console.error("Error uploading image:", error);
            }
        }
    };
    
    
    

    // Populate form with ticket data if editing an existing ticket
    useEffect(() => {
        if (selectedTicket) {
            setTitle(selectedTicket.title);
            setDescription(selectedTicket.description);
            setSeverity(selectedTicket.severity);
            setStatus(selectedTicket.status);
            setContactMethod(selectedTicket.contact_method || "");
            setNotes("");
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
    
        // Update the description with any additional notes
        const updatedDescription = notes ? `${description}\n\nUpdate:\n${notes}` : description;
    
        // Create the ticket data object
        const ticketData = { 
            title, 
            description: updatedDescription, 
            severity, 
            status, 
            contact_method: contactMethod,
        };
    
        // Include the image URL if it exists
        if (imageUrl) {
            ticketData.image_url = imageUrl; // Use the already uploaded image URL
        }
    
        try {
            // Send the ticket data to the backend
            await onSave(ticketData);
    
            // Optionally reset the form after successful submission
            setTitle("");
            setDescription("");
            setSeverity("");
            setStatus("Open");
            setContactMethod("");
            setNotes("");
            setImage(null);
            setImageUrl(null); // Clear the image URL state
        } catch (error) {
            console.error('Error submitting ticket:', error);
            alert("Failed to submit the ticket. Please try again.");
        }
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

            {user?.role === 'admin' && (
                <div className="form-box d-flex flex-column align-items-center">
                    <div className="type-div">
                        <textarea
                            className="form-control input-box"
                            placeholder="Updates"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            style={{ height: "100px" }}
                        />
                    </div>
                </div>
            )}

            {!selectedTicket ? (
            <div className="input-form-box d-flex flex-column align-items-center">
                <div className="input-div">
                <input
                    type="file"
                    className="form-control form-select-boxes image-upload select-box"
                    id="imageUpload"
                    onChange={handleImageChange}
                />
                </div>
            </div>
            ) : null}

            <div className="input-form-box d-flex flex-column align-items-center">
                <div className="input-div">
                    <select 
                    className="form-select form-select-boxes select-box" 
                    value={severity} 
                    onChange={(e) => setSeverity(e.target.value)}
                    required
                    >
                    <option value="" disabled>Select Priority</option>
                    
                    {/* If editing an existing ticket, show the selected severity and provide other options */}
                    {selectedTicket ? (
                        <>
                        {/* Pre-select the existing severity */}
                        <option value={selectedTicket.severity} disabled>
                            {selectedTicket.severity.charAt(0).toUpperCase() + selectedTicket.severity.slice(1)}
                        </option>
                        {/* Add other severity options */}
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        </>
                    ) : (
                        // If creating a new ticket, show all options
                        <>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        </>
                    )}
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
                
                {/* If editing an existing ticket, show the selected contact method and provide other options */}
                {selectedTicket ? (
                    <>
                    {/* Pre-select the existing contact method */}
                    <option value={selectedTicket.contact_method} disabled>
                        {selectedTicket.contact_method}
                    </option>
                    {/* Add the other options the user can change to */}
                    <option value={user?.email}>{user?.email}</option>
                    <option value={`Call - ${user?.phone_number}`}>Call - {user?.phone_number}</option>
                    <option value={`Text - ${user?.phone_number}`}>Text - {user?.phone_number}</option>
                    <option value="Google Chats">Google Chats</option>
                    <option value="Store">Store</option>
                    </>
                ) : (
                    // If creating a new ticket, show all options
                    <>
                    <option value={user?.email}>{user?.email}</option>
                    <option value={`Call - ${user?.phone_number}`}>Call - {user?.phone_number}</option>
                    <option value={`Text - ${user?.phone_number}`}>Text - {user?.phone_number}</option>
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
