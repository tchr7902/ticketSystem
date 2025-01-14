import React, { useState, useEffect } from "react";
import { FaFileUpload, FaFileDownload, FaEye } from 'react-icons/fa'
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
    const [fileName, setFileName] = useState('');
    const [imageUrl, setImageUrl] = useState(null); 
    const [showImage, setShowImage] = useState(false);
    const { user } = useAuth(); 

    const handleImageChange = async (e) => {
        const file = e.target.files[0]; 
        if (file) {
            setImage(file); 
            setFileName(file.name);
    
            try {
                const response = await uploadImage(file);
                const { image_url } = response; 
                
                setImageUrl(image_url);
            } catch (error) {
                console.error("Error uploading image:", error);
            }
        }
    };

    const handleDivClick = () => {
        document.getElementById('imageUpload').click();
      };

    const toggleImage = () => {
    setShowImage((prevShowImage) => !prevShowImage);
    };
    
    useEffect(() => {
        if (selectedTicket) {
            setTitle(selectedTicket.title);
            setDescription(selectedTicket.description);
            setSeverity(selectedTicket.severity);
            setStatus(selectedTicket.status);
            setContactMethod(selectedTicket.contact_method);
            setNotes("");
        } else {
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
            ticketData.image_url = imageUrl;
        }
    
        try {
            await onSave(ticketData);
    
            setTitle("");
            setDescription("");
            setSeverity("");
            setStatus("Open");
            setContactMethod("");
            setNotes("");
            setImage(null);
            setImageUrl(null);
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
                        maxLength={30}
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
            <div className="input-form-box">
                <div className="form-control image-upload" onClick={handleDivClick}>
                {/* Hidden File Input */}
                <input
                    type="file"
                    id="imageUpload"
                    onChange={handleImageChange}
                    style={{ display: 'none' }} // Hide default file input
                />
                <span>Upload Image</span>
                <FaFileUpload />
                </div>

                {/* Display selected file name */}
                {fileName && (
                <div className="file-name">
                    Selected image: {fileName}
                </div>
                )}
            </div>
            ) : (
            selectedTicket.image_url ? (
                <div>
                <div className="download-image">
                <a>Download Uploaded Image</a>
                <a href={selectedTicket.image_url}><FaFileDownload className="react-icon"/></a>
                </div>
                <div className="url-image">
                <p>{selectedTicket.image_url.split('/').pop().split('?')[0]}</p>
                <FaEye className="react-icon image-eye" onClick={toggleImage}></FaEye>
                </div>
                {showImage && (
                    <div className="uploaded-image-div">
                    <img src={selectedTicket.image_url}></img>
                    </div>
                )}
                </div>
            ) : null
            )}

            <div className="input-form-box d-flex flex-column align-items-center">
                <div className="input-div">
                    <select 
                    className="form-select form-select-boxes select-box" 
                    value={severity} 
                    onChange={(e) => setSeverity(e.target.value)}
                    required
                    >
                    <option value="" disabled>Select Priority</option>
                    
                    {selectedTicket ? (
                        <>
                        <option value={selectedTicket.severity} disabled>
                            {selectedTicket.severity.charAt(0).toUpperCase() + selectedTicket.severity.slice(1)}
                        </option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        </>
                    ) : (
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
                
                {selectedTicket ? (
                    <>
                    <option value={selectedTicket.contact_method} disabled>
                        {selectedTicket.contact_method}
                    </option>
                    <option value={user?.email}>{user?.email}</option>
                    <option value={`Call - ${user?.phone_number}`}>Call - {user?.phone_number}</option>
                    <option value={`Text - ${user?.phone_number}`}>Text - {user?.phone_number}</option>
                    <option value="Google Chats">Google Chats</option>
                    <option value="Store">Store</option>
                    </>
                ) : (
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
