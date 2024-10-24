import React, { useContext, useState } from 'react';
import { AuthContext } from '../utils/authContext';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/App.css';
import logo from '../images/gem_logo.png';
import user_logo from '../images/user_icon.png';

const ProfilePage = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

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
        navigate('/tickets')
    }

    if (!user) {
        return <p className="text-center text-danger mt-5">No user logged in.</p>;
    }

    return (
    <div className="container mt-5">
            {/* Toast Container */}
            <ToastContainer
            position="top-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Bounce}
        />
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
                <img 
                    className="responsive-icon" 
                    src={user_logo} 
                    alt="user icon" 
                />
                <h1>Hello, {user.first_name}!</h1>
                <p>{user.email}</p>
                <p>{getStoreName(user.store_id)}</p>
                <p>{user.role}</p>
            </div>
    </div>
    );
};

export default ProfilePage;
