import React, { useContext } from "react";
import TicketList from "../components/TicketList.jsx";
import { AuthContext } from "../utils/authContext"; 

function TicketPage() {
    const { user } = useContext(AuthContext); 


    if (!user) {
        return <p>Please log in to view your tickets.</p>; 
    }
    const userRole = user.role;

    return (
        <div>
            <h1>Ticketing System</h1>
            <TicketList />
        </div>
    );
}

export default TicketPage;
