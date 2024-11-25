import React, { useContext, useState, useRef, useEffect } from "react";
import TicketList from "../components/TicketList.jsx";
import { AuthContext } from "../utils/authContext"; 
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/App.css';
import logo from '../images/gem_logo.png';
import { ToastContainer, Bounce } from 'react-toastify';
import { FaBars } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaUser, FaCog, FaHome, FaUserPlus, FaSignOutAlt, FaBook } from 'react-icons/fa';
import { faComment as regularComment } from '@fortawesome/free-regular-svg-icons';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { submitFeedback } from "../utils/api.js";

function TicketPage() {
    const { user, logout } = useContext(AuthContext);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [chatDropdownOpen, setChatDropdownOpen] = useState(false);
    const [backupDropdownOpen, setBackupDropdownOpen] = useState(false);
    const [contactITModalOpen, setContactITModalOpen] = useState(false);
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [feedback, setFeedback] = useState('');
    const dropdownRef = useRef(null);
    const backupDropdownRef = useRef(null);
    const chatDropdownRef = useRef(null); 
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

    const handleAdminClick = () => {
        navigate("/admin");
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
            showToast("Feedback submitted successfully!", "success"); 
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
            console.error('Feedback cannot be empty');
        }
    };

    
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
            }
            if (
                backupDropdownRef.current &&
                !backupDropdownRef.current.contains(event.target)
            ) {
                setBackupDropdownOpen(false);
            }
            if (
                chatDropdownRef.current &&
                !chatDropdownRef.current.contains(event.target)
            ) {
                setChatDropdownOpen(false); 
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

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
                            <div className="navbar-item navbar-home-div">
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
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss={false}
                    draggable
                    pauseOnHover={false}
                    theme="light"
                    transition={Bounce}
                />
                <TicketList />
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
                    style={{ color: '#1C1C1C' }}
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
                    centered
                >
                    <Modal.Header closeButton className="modal-title text-white">
                        <Modal.Title>
                            <h3 className="m-0">Have a showstopping problem?</h3>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="chat-modal px-4 py-3">
                        <h5 className="modal-header text-secondary">
                            Call or Text the IT Team Directly
                        </h5>
                        <div className="contact-info mb-2">
                            <p className="mb-1">
                                <strong>Nathan Bascom</strong> 
                                <span className="text-muted"> - (385) 272-1205</span>
                            </p>
                            <p>
                                <strong>Trevor Christensen</strong> 
                                <span className="text-muted"> - (385) 228-6977</span>
                            </p>
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
                centered
            >
                <Modal.Header closeButton className="modal-title text-white">
                    <Modal.Title>
                        <h3 className="m-0">Have Feedback?</h3>
                    </Modal.Title>
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
                    <button className="btn-important" onClick={handleSubmitUserFeedback}>Submit</button>
                </Modal.Footer>
            </Modal>
        </div>    
    );
}

export default TicketPage;
