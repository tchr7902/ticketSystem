import React, { useContext, useState, useRef, useEffect } from "react";
import TicketList from "../components/TicketList.jsx";
import { AuthContext } from "../utils/authContext"; 
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/App.css';
import logo from '../images/gem_logo.png';
import user_logo from '../images/user_icon.png';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment as regularComment } from '@fortawesome/free-regular-svg-icons';
import { Modal, Button } from 'react-bootstrap';

function TicketPage() {
    const { user, logout } = useContext(AuthContext);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [chatWindowOpen, setChatWindowOpen] = useState(false);
    const [backupDropdownOpen, setBackupDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const backupDropdownRef = useRef(null);
    const navigate = useNavigate();

    const handleUserIconClick = () => {
        setDropdownOpen((prevState) => !prevState);
    };

    const handleBackupUserIconClick = () => {
        setBackupDropdownOpen((prevState) => !prevState);
    };
    
    const handleLogout = () => {
        logout();
        navigate("/users/login");
    };

    const handleProfileClick = () => {
        navigate("/profile");
    };

    const handleSettingsClick = () => {
        navigate("/settings");
    };

    const handleChatClick = () => {
        setChatWindowOpen(true);
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
                        <img src={logo} alt="Logo" style={{ width: '219px', height: '50px', marginRight: '30px' }} />
                        <h2>IT Support Hub</h2>
                    </a>
                    <div className="d-flex align-items-center position-relative" ref={dropdownRef}>
                        <img 
                            className="responsive-icon" 
                            src={user_logo} 
                            alt="user icon" 
                            onClick={handleUserIconClick} 
                        />
                        {dropdownOpen && (
                            <div className="dropdown-menu show position-absolute" style={{ right: 0, top: '60px' }}>
                                <button className="dropdown-item" onClick={handleProfileClick}>
                                    Profile
                                </button>
                                <button className="dropdown-item" onClick={handleSettingsClick}>
                                    Settings
                                </button>
                                <div className="dropdown-divider"></div>
                                <button className="dropdown-item text-danger" onClick={handleLogout}>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <nav className="backup-navbar">
                <img src={logo} alt="Logo" style={{ width: '188px', height: '43px' }} />
                <div ref={backupDropdownRef} className="position-relative">
                    <img
                        className="responsive-icon"
                        src={user_logo}
                        alt="user icon"
                        onClick={handleBackupUserIconClick}
                    />
                    {backupDropdownOpen && (
                        <div className="dropdown-menu show position-absolute" style={{ right: '20px', top: '80px' }}>
                            <button className="dropdown-item" onClick={handleProfileClick}>
                                Profile
                            </button>
                            <button className="dropdown-item" onClick={handleSettingsClick}>
                                Settings
                            </button>
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
                    backgroundColor: '#fff',
                    borderRadius: '50%', 
                    padding: '10px'
                }}
                onClick={handleChatClick}
            >
                <FontAwesomeIcon
                    className="responsive-chat-icon"
                    icon={regularComment}
                    style={{ color: '#1C1C1C' }}
                />
            </div>
            <Modal
                    show={chatWindowOpen}
                    onHide={() => {
                        setChatWindowOpen(false);
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
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setChatWindowOpen(false);
                            }}
                        >
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
        </div>
    );
}

export default TicketPage;
