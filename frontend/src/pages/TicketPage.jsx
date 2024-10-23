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
import { faComment } from '@fortawesome/free-solid-svg-icons';

function TicketPage() {
    const { user, logout } = useContext(AuthContext);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const handleUserIconClick = () => {
        setDropdownOpen((prevState) => !prevState);
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

    const handleChatClick = () => {
        // Add functionality for chat (e.g., open chat window)
        alert("Chat functionality coming soon!"); // Placeholder for chat functionality
    };

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
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
                        <h2>IT Tickets</h2>
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
                <img className="responsive-icon"
                    src={user_logo} 
                    alt="user icon" 
                    onClick={handleUserIconClick}
                />
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
                className="chat-icon" 
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
                    icon={faComment} 
                    style={{ width: '40px', height: '40px', color: '#007bff' }} // Customize the icon's color
                />
            </div>
        </div>
    );
}

export default TicketPage;
