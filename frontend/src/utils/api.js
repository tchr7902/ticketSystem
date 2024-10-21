import axios from 'axios';

const BASE_URL = "http://localhost:5000/api/tickets";
const USER_URL = "http://localhost:5000/api"

export async function fetchTickets() {
    const response = await fetch(BASE_URL);
    return await response.json();
}

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

export const loginUser = async (email, password) => {
    const response = await axios.post(`${USER_URL}/login`, { email, password });
    return response.data;
}

export const registerUser = async (email, password) => {
    const response = await axios.post(`${USER_URL}/register`, { email, password });
    return response.data;
}

export const fetchUser = async (token) => {
    const response = await axios.get(`${USER_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}