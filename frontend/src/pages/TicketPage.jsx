import React, { useContext, useState, useRef, useEffect } from "react";
import TicketList from "../components/TicketList.jsx";
import { AuthContext } from "../utils/authContext"; 
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/App.css';
import logo from '../images/gem_logo.png';
import user_logo from '../images/user_icon.png';

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
        navigate("/login")
    }

    const handleProfileClick = () => {
        navigate("/profile")
    }

    const handleSettingsClick = () => {
        navigate("/settings")
    }

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
        return <p className="text-center mt-5">Loading...</p>;
    }

    return (
        <div>
            {/* Navbar with Header */}
            <nav className="navbar navbar-expand-lg custom-navbar px-5">
                <div className="container-fluid">
                    <a className="navbar-brand fw-bold fs-2" href="#">
                        <img src={logo} alt="Logo" style={{ width: '219px', height: '50px', marginRight: '30px' }} />
                        IT Tickets
                    </a>
                    <div className="d-flex align-items-center position-relative" ref={dropdownRef}>
                        <img 
                            src={user_logo} 
                            alt="user icon" 
                            style={{ width: '51px', height: '51px', cursor: 'pointer' }} 
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
                <img 
                    src={user_logo} 
                    alt="user icon" 
                    style={{ width: '61px', height: '61px' }} 
                    onClick={handleUserIconClick} 
                />
            </nav>

            {/* Ticket List Section */}
            <div className="container mt-5 mb-5">
                <TicketList />
            </div>
        </div>
    );
}

export default TicketPage;
