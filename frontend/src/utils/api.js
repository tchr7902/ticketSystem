import axiosInstance from './axiosInstance';

const BASE_URL = "/tickets";
const USER_URL = "/users";

// Ticket-related functions
export const fetchTickets = async () => {
    try {
        const response = await axiosInstance.get(BASE_URL); 
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            logout();
        }
        console.error('Error fetching tickets:', error);
        throw error;
    }
};
    

export const createTicket = async (ticket) => {
    try {
        const response = await axiosInstance.post(BASE_URL, ticket); 
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            logout();
        }
        console.error('Error creating ticket:', error);
        throw error;
    }
};

export const updateTicket = async (id, updates) => {
    try {
        const response = await axiosInstance.put(`${BASE_URL}/${id}`, updates); 
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            logout();
        }
        console.error('Error updating ticket:', error);
        throw error;
    }
};

export const deleteTicket = async (id) => {
    try {
        await axiosInstance.delete(`${BASE_URL}/${id}`);
    } catch (error) {
        if (error.response && error.response.status === 401) {
            logout();
        }
        console.error('Error deleting ticket:', error);
        throw error;
    }
};

export const searchTickets = async (keywords) => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/search`, {
            params: { keywords }
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            logout();
        }
        console.error('Error searching tickets:', error);
        throw error;
    }
};

// User-related functions
export const loginUser = async (email, password) => {
    const response = await axiosInstance.post(`${USER_URL}/login`, { email, password });
    return response.data;
};

export const registerUser = async (email, password, first_name, last_name, phone_number, store_id) => {
    const response = await axiosInstance.post(`${USER_URL}/register`, { email, password, store_id, first_name, last_name, phone_number }); 
    return response.data; 
};

export const registerAdmin = async (email, password, first_name, last_name, store_id) => {
    const response = await axiosInstance.post(`${USER_URL}/admin/register`, { email, password, first_name, last_name, store_id }); 
    return response.data; 
};

export const fetchUser = async (token) => {
    try {
        const response = await axiosInstance.get(`${USER_URL}/me`, {
            headers: {
                Authorization: `Bearer ${token}`, 
            },
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            logout();
        }
        console.error('Error fetching user:', error);
        throw error;
    }
};

export const changeUserPassword = async (email, currentPassword, newPassword) => {
    try {
        const response = await axiosInstance.post(`${USER_URL}/change-password`, {
            email,
            currentPassword,
            newPassword,
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            logout();
        }
        console.error('Error changing password:', error);
        throw error;
    }
};

export const changeUserEmail = async (currentEmail, newEmail) => {
    try {
        const response = await axiosInstance.post(`${USER_URL}/change-email`, {
            currentEmail,
            newEmail
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            logout();
        }
        console.error('Error changing email:', error);
        throw error;
    }
};

export const getUserTickets = async (user_id) => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/user/${user_id}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            logout();
        }
        console.error('Error fetching tickets:', error);
        throw error;
    }
};

export const archiveTicket = async (ticketId, notes) => {
    try {
        const response = await axiosInstance.post(
            `${BASE_URL}/${ticketId}/archive`,
            { notes },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            logout();
        }
        console.error('Error archiving ticket:', error);
        throw error;
    }
};

export const fetchArchivedTickets = async (userId) => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/users/${userId}/archived`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            logout();
        }
        console.error('Error fetching archived tickets:', error);
        throw error;
    }
};