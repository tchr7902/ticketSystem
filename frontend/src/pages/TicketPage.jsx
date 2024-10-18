import React from "react";
import TicketList from "../components/TicketList.jsx";

function TicketPage() {
    return (
        <div>
            <h1>Ticketing System</h1>
            <TicketList /> {/* TicketList handles everything now */}
        </div>
    );
}

export default TicketPage;
