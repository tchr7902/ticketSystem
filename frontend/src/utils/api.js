import axiosInstance from './axiosInstance';

const BASE_URL = "/tickets";
const USER_URL = "/users";

export const fetchTickets = async () => {
    try {
        const response = await axiosInstance.get(BASE_URL); 
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            throw error;
        }
        throw error;
    }
};
    

export const createTicket = async (ticket) => {
    try {
        const response = await axiosInstance.post(BASE_URL, ticket); 
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            throw error;
        }
        throw error;
    }
};

export const uploadImage = async (imageFile) => {
    try {
        const formData = new FormData();
        formData.append('image', imageFile);  // 'image' is the field name used on the backend

        const response = await axiosInstance.post(`${BASE_URL}/upload-image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',  // Set the correct header for file upload
            },
        });

        return response.data;  // Return the response from the backend (e.g., the image URL)
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

export const updateTicket = async (id, updates) => {
    try {
        const response = await axiosInstance.put(`${BASE_URL}/${id}`, updates); 
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            throw error;
        }
        throw error;
    }
};

export const deleteTicket = async (id) => {
    try {
        await axiosInstance.delete(`${BASE_URL}/${id}`);
    } catch (error) {
        if (error.response && error.response.status === 401) {
            throw error;
        }
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
            throw error;
        }
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
            throw error;
        }
        throw error;
    }
};

export const deleteUser = async (user_id) => {
    try {
        await axiosInstance.delete(`${USER_URL}/${user_id}`);
    } catch (error) {
        if (error.response && error.response.status === 401) {
            throw error;
        }
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
            throw error;
        }
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
            throw error;
        }
        throw error;
    }
};

export const getUserTickets = async (user_id) => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/user/${user_id}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            throw error;
        }
        throw error;
    }
};

export const archiveTicket = async (ticketId, archiveNotes, timeSpent, partsNeeded) => {
    try {
        const response = await axiosInstance.post(
            `${BASE_URL}/${ticketId}/archive`,
            { archiveNotes, timeSpent, partsNeeded },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            throw error;
        }
        throw error;
    }
};

export const fetchArchivedTickets = async (userId) => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/users/${userId}/archived`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            throw error;
        }
        throw error;
    }
};

export const deleteArchivedTicket = async (id) => {
    try {
        await axiosInstance.delete(`${BASE_URL}/archived/${id}`);
    } catch (error) {
        if (error.response && error.response.status === 401) {
            throw error;
        }
        throw error;
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await axiosInstance.post(`${USER_URL}/forgot_password`, { email });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error("User not found.");
        }
        throw error;
    }
};


export const resetPassword = async (token, newPassword) => {
    try {
        const response = await axiosInstance.post(`${USER_URL}/reset_password/${token}`, {
            new_password: newPassword,
        });

        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 400) {
            throw new Error("The reset link is invalid or has expired.");
        }
        throw error;
    }
};


export const searchUsers = async (keywords) => {
    try {
        const response = await axiosInstance.get(`${USER_URL}/search_users`, {
            params: { keywords }
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            throw error;
        }
        throw error;
    }
};


export const submitFeedback = async (feedback) => {
    try {
        const response = await axiosInstance.post(`${USER_URL}/feedback`, {
            feedback,
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
        } else {
        }
        throw error; 
    }
};


export const messageUsers = async (message) => {
    try {
        const response = await axiosInstance.post(`${USER_URL}/message-users`, {
            message,
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
        } else {
        }
        throw error; 
    }
};


export const updateUser = async (id, updates) => {
    try {
        const response = await axiosInstance.put(`${USER_URL}/${id}`, updates); 
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            throw error;
        }
        throw error;
    }
};