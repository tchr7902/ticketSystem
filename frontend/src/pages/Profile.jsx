import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../utils/authContext';
import { useNavigate } from 'react-router-dom';
import { getUserTickets } from '../utils/api';
import { ToastContainer, Bounce } from 'react-toastify';
import { toast } from 'react-toastify';
import { Modal } from 'react-bootstrap';
import { FaUser, FaArrowLeft, FaSignOutAlt } from 'react-icons/fa';
import { format } from 'date-fns-tz';
import { Tooltip } from 'react-tooltip';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/App.css';
import logo from '../images/gem_logo.png';
import logo2 from '../images/gem-singlelogo.png';

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const timeZone = 'America/Denver';
    return format(date, "MMMM dd, yyyy 'at' h:mm a", { timeZone });
};

const ProfilePage = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [tickets, setTickets] = useState({ open: 0, inProgress: 0, closed: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const showToast = (message, type = "success") => {
        toast(message, { type });
    };

    const stores = [
        { store_id: 1, store_name: "Headquarters" },
        { store_id: 2, store_name: "Warehouse" },
        { store_id: 3, store_name: "American Fork" },
        { store_id: 4, store_name: "Spanish Fork" },
        { store_id: 5, store_name: "Orem" },
        { store_id: 6, store_name: "Riverdale" },
        { store_id: 7, store_name: "Sandy" },
        { store_id: 8, store_name: "Park City" },
        { store_id: 9, store_name: "Layton" },
    ];

    const getStoreName = (store_id) => {
        const store = stores.find(store => store.store_id === store_id);
        return store ? store.store_name : "Unknown Store";
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const backButton = () => {
        navigate('/home');
    }

    useEffect(() => {
        const fetchUserTickets = async () => {
            try {
                const data = await getUserTickets(user.id);
                setTickets({ open: data.Open || 0, inProgress: data["In Progress"] || 0, closed: data.Closed || 0 });
            } catch (error) {
                if (error.status === 401) {
                    showToast("Login token has expired. Please log back in.")
                } else {
                    showToast(error.message);
                }
            }
        };
        if (user) fetchUserTickets();
    }, [user]);

    if (!user) return (
        <div className="loader-wrapper">
            <div className="lds-ellipsis">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    );

    return (
        <div className="container mt-5">
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
            <nav className="profile-navbar">
                <FaArrowLeft className="react-icon" size={40} onClick={backButton}
                    data-tooltip-id="back-tooltip"
                    data-tooltip-content="Back"
                    data-tooltip-delay-show={300}></FaArrowLeft>
                <img src={logo} alt="Logo" style={{ width: '375px', height: '86px' }} />
                <FaSignOutAlt className="react-icon" size={40} onClick={handleLogout}
                    data-tooltip-id="logout-tooltip"
                    data-tooltip-content="Logout"
                    data-tooltip-delay-show={300}></FaSignOutAlt>
            </nav>
            <nav className="backup-profile-navbar">
                <FaArrowLeft className="react-icon" size={30} onClick={backButton}
                    data-tooltip-id="back-tooltip"
                    data-tooltip-content="Back"
                    data-tooltip-delay-show={300}></FaArrowLeft>
                <img src={logo2} alt="Logo" style={{ width: '91px', height: '91px' }} />
                <FaSignOutAlt className="react-icon" size={30} onClick={handleLogout}
                    data-tooltip-id="logout-tooltip"
                    data-tooltip-content="Logout"
                    data-tooltip-delay-show={300}></FaSignOutAlt>
            </nav>
            <div className="my-info">
                <FaUser className="profile-icon" />
                <h1>Hello, {user.first_name}!</h1>
                <p className="p-profile">{user.email}</p>
                <p className="p-profile">{user.phone_number}</p>
                <p className="p-profile">{getStoreName(user.store_id)}</p>
                <p className="p-profile">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
            </div>
            <div className="my-tickets">
                {user.role === "user" && (
                    <div>
                        <h3>My Ticket Status</h3>
                        <div className="ticket-status-numbers">
                            <p><strong>Open: </strong>{tickets.open}</p>
                            <p><strong>In Progress: </strong>{tickets.inProgress}</p>
                            <p><strong>Closed: </strong>{tickets.closed}</p>
                        </div>
                    </div>
                )}
            </div>
            <Tooltip id="logout-tooltip" />
            <Tooltip id="back-tooltip" />
        </div>
    );
};

export default ProfilePage;
