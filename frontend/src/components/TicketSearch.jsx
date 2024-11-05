import React, { useContext, useState, useEffect, useCallback } from 'react';
import { searchTickets } from "../utils/api"; 
import { Modal } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import { format } from 'date-fns-tz';


const formatDate = (dateString) => {
    const date = new Date(dateString);
    const timeZone = 'America/Denver';
    return format(date, "MMMM dd, yyyy 'at' h:mm a", { timeZone });
};

const CollapsibleCard = ({ name, contact_method, title, description, status, severity, created_at }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`card ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
            <div className="card-header">
                <strong>{title}</strong>
                <span>{isOpen ? '-' : '+'}</span>
            </div>
            {isOpen && (
                <div className="card-body">
                    <p><strong>Submitted By:</strong> {name}</p>
                    <p><strong>Contact Method:</strong> {contact_method}</p>
                    <p><strong>Description:</strong> {description}</p>
                    <p><strong>Status:</strong> {status}</p>
                    <p><strong>Priority:</strong> {severity}</p>
                    <p><strong>Created:</strong> {formatDate(created_at)}</p>
                </div>
            )}
        </div>
    );
};

function TicketSearch() {
    const [keywords, setKeywords] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchResults, setSearchResults] = useState([]); 
    const [showResultsModal, setShowResultsModal] = useState(false); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await searchTickets(keywords); 
            setSearchResults(data);
            setShowResultsModal(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {loading ? (
                <div className="text-center">
                    <div className="loader-wrapper-2">
                        <div className="lds-ellipsis">
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </div> 
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="mb-4">
                    <div className="form-box d-flex flex-column align-items-center">
                        <div className="type-div">
                            <input
                                type="text"
                                className="form-control input-box"
                                placeholder="Keywords"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    <div className="d-flex justify-content-center flex-column align-items-center">
                        <div>
                            <button type="submit" className="btn-important ticket-save">Search</button>
                        </div>
                        {error && <div className="text-danger mt-4">{error}</div>} {/* Error message */}
                    </div>
                </form>
            )}

            {/* Modal for displaying search results */}
            <Modal show={showResultsModal} onHide={() => setShowResultsModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title><h3>Search Results</h3></Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {searchResults.length > 0 ? (
                        searchResults.map(ticket => {
                            const {
                                id,
                                name,
                                contact_method,
                                title,
                                description,
                                status,
                                severity,
                                created_at
                            } = ticket;

                            return (
                                <CollapsibleCard
                                    key={id}
                                    name={name}
                                    contact_method={contact_method}
                                    title={title}
                                    description={description}
                                    status={status}
                                    severity={severity}
                                    created_at={created_at}
                                />
                            );
                        })
                    ) : (
                        !loading && <p className="mt-4 ml-5">No tickets found matching your search.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn-2" onClick={() => setShowResultsModal(false)}>Close</button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default TicketSearch;

