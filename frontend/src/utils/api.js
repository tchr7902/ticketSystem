import axiosInstance from './axiosInstance';

const BASE_URL = "/tickets";
const USER_URL = "/users";

// Ticket-related functions
export const fetchTickets = async () => {
    const response = await axiosInstance.get(BASE_URL); 
    return response.data;
};

export const createTicket = async (ticket) => {
    const response = await axiosInstance.post(BASE_URL, ticket); 
    return response.data; 
};

export const updateTicket = async (id, updates) => {
    const response = await axiosInstance.put(`${BASE_URL}/${id}`, updates); 
    return response.data; 
};

export const deleteTicket = async (id) => {
    await axiosInstance.delete(`${BASE_URL}/${id}`); 
};

// User-related functions
export const loginUser = async (email, password) => {
    const response = await axiosInstance.post(`${USER_URL}/login`, { email, password });
    return response.data;
};

export const registerUser = async (email, password, first_name, last_name, store_id) => {
    const response = await axiosInstance.post(`${USER_URL}/register`, { email, password, first_name, last_name, store_id }); 
    return response.data; 
};

export const fetchUser = async (token) => {
    const response = await axiosInstance.get(`${USER_URL}/me`, {
        headers: {
            Authorization: `Bearer ${token}`, 
        },
    });
    return response.data;
};

export const changeUserPassword = async (email, currentPassword, newPassword) => {
    const response = await axiosInstance.post(`${USER_URL}/change-password`, {
        email,
        currentPassword,
        newPassword,
    });
    return response.data;
};

export const changeUserEmail = async (currentEmail, newEmail) => {
    const response = await axiosInstance.post(`${USER_URL}/change-email`, {
        currentEmail,
        newEmail
    });
    return response.data;
};

export const getUserTickets = async (user_id) => {
    const response = await axiosInstance.get(`${BASE_URL}/user/${user_id}`);
    return response.data;
};