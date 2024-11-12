import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../utils/authContext';
import { useNavigate } from 'react-router-dom';
import { getUserTickets } from '../utils/api';
import { Modal } from 'react-bootstrap';
import { FaUser, FaArrowLeft, FaSignOutAlt } from 'react-icons/fa';
import { format } from 'date-fns-tz';
import { Tooltip } from 'react-tooltip'
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/App.css';
import logo from '../images/gem_logo.png';
import logo2 from '../images/gem-singlelogo.png';

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const timeZone = 'America/Denver';
    return format(date, "MMMM dd, yyyy 'at' h:mm a", { timeZone });
};


const CollapsibleCard = ({ name, contact_method, title, description, status, priority, created_at, archived_at, notes }) => {
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
                    <p><strong>Priority:</strong> {priority}</p>
                    <p><strong>Created:</strong> {formatDate(created_at)}</p>
                    <p><strong>Archived:</strong> {formatDate(archived_at)}</p>
                    <p><strong>Notes:</strong> {notes}</p>
                </div>
            )}
        </div>
    );
};

const ProfilePage = () => {
    const { user, logout, getArchivedTickets } = useContext(AuthContext);
    const navigate = useNavigate();

    const [tickets, setTickets] = useState({ open: 0, inProgress: 0, closed: 0 });
    const [archivedTickets, setArchivedTickets] = useState([]);
    const [showArchivedModal, setShowArchivedModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
                    setError("Login token has expired. Please log back in.")
                } else {
                    setError(error.message);
                }
            }
        };
        if (user) fetchUserTickets();
    }, [user]);

    const fetchArchivedTickets = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getArchivedTickets(user.id);
            setArchivedTickets(data || []);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (showArchivedModal) fetchArchivedTickets();
    }, [showArchivedModal, fetchArchivedTickets]);

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
                <button className="btn-2 mt-3" onClick={() => setShowArchivedModal(true)}>
                    View Archived Tickets
                </button>
            </div>
            <Tooltip id="logout-tooltip" />
            <Tooltip id="back-tooltip" />
            
            <Modal show={showArchivedModal} onHide={() => setShowArchivedModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title><h3>Archived Tickets</h3></Modal.Title>
            </Modal.Header>
                <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {loading ? (
                        <p>Loading...</p>
                    ) : archivedTickets.length > 0 ? (
                        archivedTickets.map((ticket, index) => {
                            const [archivedTicketId, originalTicketId, user_id, title, description, status, archived_at, notes, created_at,  priority, contact_method, name] = ticket;
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
                                    notes={notes}
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
        <div className="d-flex justify-content-center">
            {error && <p className="text-danger">{error}</p>}
        </div>
        </div>
    );
};

export default ProfilePage;
