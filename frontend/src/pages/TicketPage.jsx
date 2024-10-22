import React, { useContext } from "react";
import TicketList from "../components/TicketList.jsx";
import { AuthContext } from "../utils/authContext"; 
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/App.css';
import logo from '../images/gem_logo.png';

function TicketPage() {
    const { user } = useContext(AuthContext); 

    if (!user) {
        return <p className="text-center text-danger mt-5">Please log in to view your tickets.</p>;
    }

    return (
        <div>
            {/* Navbar with Header */}
            <nav className="navbar navbar-expand-lg custom-navbar px-5">
                <div className="container-fluid">
                    <a className="navbar-brand fw-bold fs-2" href="#">
                    <img src={logo} alt="Logo" style={{ width: '219px', height: '50px', marginRight: '30px'}} />
                        IT Tickets
                    </a>
                    <div className="d-flex">
                        {/* Placeholder for future user section */}
                        <span className="navbar-text">
                            {/* Add user info or profile dropdown here later */}
                        </span>
                    </div>
                </div>
            </nav>
            <nav className="backup-navbar">
                <img src={logo} alt="Logo" style={{ width: '188px', height: '43px'}} />
            </nav>

            {/* Ticket List Section */}
            <div className="container mt-5">
                <TicketList />
            </div>
        </div>
    );
}

export default TicketPage;
