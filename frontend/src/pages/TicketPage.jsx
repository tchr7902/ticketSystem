import React, { useContext, useState, useRef, useEffect, useCallback } from "react";
import TicketList from "../components/TicketList.jsx";
import { AuthContext } from "../utils/authContext"; 
import { useNavigate } from "react-router-dom";
import { format } from 'date-fns-tz';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/App.css';
import lightLogo from '../images/gem_logo.png';
import darkLogo from '../images/gem_logo_white.png';
import { ToastContainer, Bounce } from 'react-toastify';
import { FaBars, FaCheck, FaTimes } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaUser, FaCog, FaHome, FaUserPlus, FaSignOutAlt, FaBook, FaTrashAlt, FaArchive, FaChartLine } from 'react-icons/fa';
import { faComment as regularComment } from '@fortawesome/free-regular-svg-icons';
import { Modal } from 'react-bootstrap';
import { Tooltip } from 'react-tooltip'
import { toast } from 'react-toastify';
import { submitFeedback, deleteArchivedTicket } from "../utils/api.js";


const CollapsibleCard = ({
    name,
    contact_method,
    title,
    description,
    status,
    priority,
    created_at,
    archived_at,
    notes,
    time_spent,
    parts_needed,
    assigned_employee,
    archivedTicketId,
    handleDeleteArchivedTicket,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false); 

    const formatDate = (dateString) => {
        const date = new Date(dateString); 
        if (isNaN(date)) return 'Invalid Date';
        const timeZone = 'America/Denver';
        return format(date, "MMMM dd, yyyy 'at' h:mm a", { timeZone });
    };

    const handleCardClick = () => setIsOpen(!isOpen);

    const handleDeleteClick = (e) => {
        e.stopPropagation(); 
        setShowConfirmation(true); 
    };

    const handleConfirmDelete = () => {
        handleDeleteArchivedTicket(archivedTicketId); 
        setShowConfirmation(false); 
    };

    const handleCancelDelete = (e) => {
        e.stopPropagation(); 
        setShowConfirmation(false); 
    };

    return (
        <div className={`card ${isOpen ? 'active open-card' : ''}`}>
            <div className="card-header" onClick={handleCardClick}>
                <strong>{title}</strong>
                <span>{isOpen ? '-' : '+'}</span>
            </div>
            {isOpen && (
                <div className="card-body collapsible-card-body">
                    <p><strong>Submitted By:</strong> {name}</p>
                    <p><strong>Contact Method:</strong> {contact_method}</p>
                    <p><strong>Description:</strong> {description}</p>
                    <p><strong>Status:</strong> {status}</p>
                    <p><strong>Priority:</strong> {priority.charAt(0).toUpperCase() + priority.slice(1)}</p>
                    <p><strong>Created:</strong> {formatDate(created_at)}</p>
                    <p><strong>Archived:</strong> {formatDate(archived_at)}</p>
                    <p><strong>Time Spent:</strong> {time_spent}</p>
                    <p><strong>Parts Needed:</strong> {parts_needed}</p>
                    <p><strong>Notes:</strong> {notes}</p>
                    <p><strong>Assigned To:</strong> {assigned_employee}</p>
                    <div className="delete-button-container">
                        {!showConfirmation && (
                            <FaTrashAlt onClick={handleDeleteClick}
                            data-tooltip-id="archive-delete"
                            data-tooltip-content="Delete"
                            data-tooltip-delay-show={300}
                            className="react-icon"
                            />
                        )}
                        {showConfirmation && (
                            <div className="delete-confirmation">
                                <FaTimes onClick={handleCancelDelete}
                                data-tooltip-id="archive-cancel"
                                data-tooltip-content="Cancel"
                                data-tooltip-delay-show={300}
                                className="react-icon"
                                /> 
                                <FaCheck onClick={handleConfirmDelete}
                                data-tooltip-id="archive-confirm"
                                data-tooltip-delay-show={300}
                                data-tooltip-content="Confirm"
                                className="react-icon"
                                />
                            </div>
                        )}
                    </div>
                </div>     
            )}
            <Tooltip className="react-tooltip" id="archive-delete" />
            <Tooltip className="react-tooltip" id="archive-cancel" />
            <Tooltip className="react-tooltip" id="archive-confirm" />
        </div>
    );
};



function TicketPage({}) {
    const { user, logout, getArchivedTickets } = useContext(AuthContext);
    const [archivedTickets, setArchivedTickets] = useState([]);
    const [showArchivedModal, setShowArchivedModal] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [chatDropdownOpen, setChatDropdownOpen] = useState(false);
    const [backupDropdownOpen, setBackupDropdownOpen] = useState(false);
    const [contactITModalOpen, setContactITModalOpen] = useState(false);
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [logo, setLogo] = useState('../images/gem_logo.png');
    const dropdownRef = useRef(null);
    const backupDropdownRef = useRef(null);
    const chatDropdownRef = useRef(null); 
    const [loading, setLoading] = useState(false);
    const theme = localStorage.getItem('theme');
    const navigate = useNavigate();
    const showToast = (message, type = "success") => {
        toast(message, { type });
    };

    const handleBackupMenuIconClick = () => {
        setBackupDropdownOpen((prevState) => !prevState);
    };
    
    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleProfileClick = () => {
        navigate("/profile");
    };

    const handleSettingsClick = () => {
        navigate("/settings");
    };

    const handleAnalyticsClick = () => {
        navigate("/analytics");
    };

    const handleAdminClick = () => {
        navigate("/admin");
    };

    const handleHomeClick = () => {
        window.location.reload()
    };

    const handleGuidesClick = () => {
        navigate("/guides");
    };


    const handleContactIT = () => {
        setContactITModalOpen(true); 
        setChatDropdownOpen(false); 
    };

    const handleSubmitFeedback = () => {
        setFeedbackModalOpen(true); 
        setChatDropdownOpen(false);
    };

    const submitUserFeedback = async (feedback) => {
        try {
            await submitFeedback(feedback); 
            showToast("Feedback submitted! Thank you!", "success"); 
        } catch (error) {
            showToast("Error submitting feedback", "error"); 
        }
    };
    

    const handleFeedbackChange = (event) => {
        setFeedback(event.target.value);
    };

    const handleSubmitUserFeedback = () => {
        if (feedback.trim()) {
            submitUserFeedback(feedback);
            setFeedbackModalOpen(false); 
            setFeedback('');
        } else {
            showToast("Please enter feedback.", "error");
        }
    };

    const handleDeleteArchivedTicket = async (archivedTicketId) => {
        try {
            await deleteArchivedTicket(archivedTicketId);
            setShowArchivedModal(false)
            showToast("Archived ticket deleted successfully!", "success");
        } catch (error) {    
            showToast("Failed to delete archived ticket. Please try again.", "error");
        }
    };

    const fetchArchivedTickets = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getArchivedTickets(user.id);
            setArchivedTickets(data || []);
        } catch (error) {
            showToast("Failed to fetch archived tickets. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    }, [user]);

    
    useEffect(() => {
        if (theme == 'light') {
        setLogo(lightLogo);
        } else if (theme == 'dark') {
        setLogo(darkLogo);
        }
        const handleOutsideClick = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
            if (backupDropdownRef.current && !backupDropdownRef.current.contains(event.target)) {
                setBackupDropdownOpen(false);
            }
            if (chatDropdownRef.current && !chatDropdownRef.current.contains(event.target)) {
                setChatDropdownOpen(false); 
            }
        };
    
        if (showArchivedModal) {
            fetchArchivedTickets();
        }
    
        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [showArchivedModal, fetchArchivedTickets]);
    

    if (!user) {
        return (
            <div className="loader-wrapper">
                <div className="lds-ellipsis">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        );
    }

    return (
        <div className="vh-100">
            {/* Navbar with Header */}
            <nav className="custom-navbar">
                <div className="container-fluid d-flex justify-content-between align-items-center">
                    <a className="navbar-brand fw-bold fs-2 d-flex align-items-center" href="#">
                        <img src={logo} alt="Logo" style={{ width: '263px', height: '61px', marginRight: '30px' }} />
                        <h2>IT Support Hub</h2>
                    </a>
                    {/* Menu items */}
                    <div className="d-flex align-items-center">
                        <div className="nav-items">
                            <div className="navbar-item navbar-home-div" onClick={handleHomeClick}>
                                <FaHome size={26} className="navbar-home"/>
                                <div className="navbar-text" style={{textDecoration: "underline" }}>
                                    <strong>Home</strong>
                                </div>
                            </div>
                            <div className="navbar-item" onClick={handleProfileClick}>
                                <FaUser size={24}/>
                                <div className="navbar-text">
                                    Profile
                                </div>
                            </div>
                            <div className="navbar-item" onClick={handleSettingsClick}>
                                <FaCog size={24}/>
                                <div className="navbar-text">
                                    Settings
                                </div>
                            </div>
                            <div className="navbar-item" onClick={handleGuidesClick}>
                                <FaBook size={24}/>
                                <div className="navbar-text">
                                    Guides
                                </div>
                            </div>
                            {user.role === "admin" && (
                                <div className="navbar-item" onClick={handleAnalyticsClick}>
                                    <FaChartLine size={24}/>
                                    <div className="navbar-text">
                                        Analytics
                                    </div>
                                </div>
                            )}
                            {user.role === "admin" && (
                                <div className="navbar-item" onClick={handleAdminClick}>
                                    <FaUserPlus size={24}/>
                                    <div className="navbar-text">
                                        Admin
                                    </div>
                                </div>
                            )}
                            <div className="navbar-item navbar-logout" onClick={handleLogout}>
                                <FaSignOutAlt size={24}/>
                                <div className="navbar-text">
                                    Logout
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <nav className="backup-navbar">
                <img src={logo} alt="Logo" style={{ width: '188px', height: '43px' }} />
                <div ref={backupDropdownRef} className="position-relative">
                    <FaBars
                        className="home-page-icon"
                        onClick={handleBackupMenuIconClick}
                    />
                    {backupDropdownOpen && (
                            <div 
                                className="dropdown-menu show" 
                                style={{
                                    position: 'absolute', 
                                    right: 0, 
                                    top: '100%',
                                    marginTop: '5px',
                                    zIndex: 1050,
                                }}
                            >
                            <button className="dropdown-item" onClick={handleProfileClick}>
                                Profile
                            </button>
                            <button className="dropdown-item" onClick={handleSettingsClick}>
                                Settings
                            </button>
                            <button className="dropdown-item" onClick={handleGuidesClick}>
                                Guides
                            </button>
                            {user.role == "admin" && (
                            <button className="dropdown-item" onClick={handleAnalyticsClick}>
                                Analytics
                            </button>
                            )}
                            {user.role == "admin" && (
                            <button className="dropdown-item" onClick={handleAdminClick}>
                                + Admin
                            </button>
                            )}
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item text-danger" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Ticket List Section */}
            <div className="container page-div">
                {/* Toast Container */}
                <ToastContainer
                    position="top-center"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss={false}
                    draggable
                    pauseOnHover={false}
                    theme={theme}
                    transition={Bounce}
                />
                <TicketList setShowArchivedModal={setShowArchivedModal}/>
            </div>

            {/* Chat Icon */}
            <div 
                className="chat-div" 
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    cursor: 'pointer',
                    zIndex: 1000,
                    borderRadius: '50%', 
                    padding: '10px'
                }}
                onClick={() => setChatDropdownOpen((prev) => !prev)}
            >
                <FontAwesomeIcon
                    className="responsive-chat-icon"
                    icon={regularComment}
                />
            </div>

            {/* Chat Dropdown */}
            {chatDropdownOpen && (
                <div
                    ref={chatDropdownRef}
                    className="dropdown-menu show"
                    style={{
                        position: 'fixed',
                        bottom: '10%',
                        right: '20px',
                        zIndex: 1050,
                    }}
                >
                    <button className="dropdown-item" onClick={handleContactIT}>Contact IT</button>
                    <button className="dropdown-item" onClick={handleSubmitFeedback}>Submit Feedback</button>
                </div>
            )}
             {/* Contact IT Modal */}
             <Modal
                show={contactITModalOpen}
                onHide={() => {
                    setContactITModalOpen(false);
                }}
            >
                <Modal.Header>
                    <Modal.Title>
                        <h3 className="m-0">Contact IT</h3>
                    </Modal.Title>
                    <FaTimes
                        className="close-modal-times"
                        onClick={() => {
                            setContactITModalOpen(false);
                        }}
                    ></FaTimes>
                </Modal.Header>
                <Modal.Body className="chat-modal px-4 py-3">
                    <div className="contact-info">
                        <div className="mb-3">
                            <h5 className="mb-1">
                                IT Phone Number
                            </h5>
                            <p className="mb-1">(385) 204-3181</p>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-end px-4">
                    <button
                        className="btn-2"
                        onClick={() => {
                            setContactITModalOpen(false);
                        }}
                    >
                        Close
                    </button>
                </Modal.Footer>
            </Modal>


            {/* Submit Feedback Modal */}
            <Modal
                show={feedbackModalOpen}
                onHide={() => setFeedbackModalOpen(false)}
            >
                <Modal.Header>
                    <Modal.Title>
                        <h3 className="m-0">Submit Feedback</h3>
                    </Modal.Title>
                    <FaTimes
                        className="close-modal-times"
                        onClick={() => {
                            setFeedbackModalOpen(false);
                        }}
                    ></FaTimes>
                </Modal.Header>
                <Modal.Body>
                    <textarea
                        className="form-control"
                        rows="5"
                        placeholder="Enter your feedback here..."
                        value={feedback} 
                        onChange={handleFeedbackChange}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn-2" onClick={() => setFeedbackModalOpen(false)}>Close</button>
                    <button className="btn-important" onClick={handleSubmitUserFeedback}>Send</button>
                </Modal.Footer>
            </Modal>
            {/* Archived Tickets Modal */}
            <Modal show={showArchivedModal} onHide={() => setShowArchivedModal(false)}>
                <Modal.Header>
                    <Modal.Title><h3>Archived Tickets</h3></Modal.Title>
                    <FaTimes
                        className="close-modal-times"
                        onClick={() => {
                            setShowArchivedModal(false);
                        }}
                    ></FaTimes>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {loading ? (
                        <p>Loading...</p>
                    ) : archivedTickets.length > 0 ? (
                        archivedTickets.map((ticket) => {
                            const [archivedTicketId, , , title, description, status, archived_at, notes, created_at, priority, contact_method, name, time_spent, parts_needed, assigned_employee] = ticket;
                            return (
                                <CollapsibleCard
                                    key={archivedTicketId}
                                    name={name}
                                    contact_method={contact_method}
                                    title={title}
                                    description={description}
                                    status={status}
                                    priority={priority}
                                    created_at={created_at}
                                    archived_at={archived_at}
                                    time_spent={time_spent}
                                    parts_needed={parts_needed}
                                    notes={notes}
                                    assigned_employee={assigned_employee}
                                    archivedTicketId={archivedTicketId}
                                    handleDeleteArchivedTicket={handleDeleteArchivedTicket}
                                />
                            );
                        })
                    ) : (
                        <p>No archived tickets found.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn-2" onClick={() => setShowArchivedModal(false)}>Close</button>
                </Modal.Footer>
            </Modal>
        </div>    
        
    );
}

export default TicketPage;
