import axios from 'axios';

const BASE_URL = "http://localhost:5000/tickets";
const USER_URL = "http://localhost:5000/users";

// Ticket-related functions
export const fetchTickets = async () => {
    const token = localStorage.getItem('token'); // Get the token from local storage

    const response = await axios.get('http://localhost:5000/tickets', {
        headers: {
            Authorization: `Bearer ${token}`, // Include the token in the headers
        },
    });

    return response.data; // Return the tickets
};

export async function createTicket(ticket) {
    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticket),
    });
    return await response.json();
}

export async function updateTicket(id, updates) {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
    });
    return await response.json();
}

export async function deleteTicket(id) {
    await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
}

// User-related functions
export const loginUser = async (email, password) => {
    const response = await axios.post(`${USER_URL}/login`, { email, password });
    return response.data;
};

export const registerUser = async (email, password) => {
    const response = await axios.post(`${USER_URL}/register`, { email, password });
    return response.data;
};

export const fetchUser = async (token) => {
    const response = await axios.get(`${USER_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};
