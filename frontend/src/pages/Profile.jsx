import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../utils/authContext';
import { useNavigate } from 'react-router-dom';
import { getUserTickets } from '../utils/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/App.css';
import logo from '../images/gem_logo.png';
import user_logo from '../images/user_icon.png';

const ProfilePage = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [tickets, setTickets] = useState({
        open: 0,
        inProgress: 0,
        closed: 0,
    });
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
        navigate('/users/login');
    };

    const backButton = () => {
        navigate('/tickets')
    };

    useEffect(() => {
        const fetchUserTickets = async () => {
            try {
                const data = await getUserTickets(user.id);

                const openCount = data.Open || 0; 
                const inProgressCount = data["In Progress"] || 0; 
                const closedCount = data.Closed || 0;

                setTickets({ open: openCount, inProgress: inProgressCount, closed: closedCount });
            } catch (error) {
                console.error("Error fetching user tickets:", error);
                setError(error.message); 
            }
        };

        if (user) {
            fetchUserTickets();
        }
    }, [user]);

    if (!user) {
        return <p className="text-center text-danger mt-5">No user logged in.</p>;
    }

    return (
        <div className="container mt-5">
            <nav className="profile-navbar">
                <button className="btn btn-outline-secondary mt-3" onClick={backButton}>Back</button>
                <img src={logo} alt="Logo" style={{ width: '375px', height: '86px', marginRight: '30px' }} />
                <button className="btn-important btn-outline-danger mt-3" onClick={handleLogout}>Logout</button>
            </nav>
            <nav className="backup-profile-navbar">
                <button className="btn btn-outline-secondary mt-3" onClick={backButton}>Back</button>
                <button className="btn-important btn-outline-danger mt-3" onClick={handleLogout}>Logout</button>
            </nav>
            <div className="my-info">
                <img className="responsive-icon" src={user_logo} alt="user icon" />
                <h1>Hello, {user.first_name}!</h1>
                <p>{user.email}</p>
                <p>{getStoreName(user.store_id)}</p>
                <p>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
            </div>
            <div className="my-tickets">
                <h3>My Ticket Status</h3>
                <div className="ticket-status-numbers">
                    <p><strong>Open: </strong>{tickets.open}</p>
                    <p><strong>In Progress: </strong>{tickets.inProgress}</p>
                    <p><strong>Closed: </strong>{tickets.closed}</p>
                </div>
            </div>
            {error && <p className="text-danger">{error}</p>}
        </div>
    );
};

export default ProfilePage;
