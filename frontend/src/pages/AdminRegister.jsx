import React, { useState, useContext, useEffect } from "react";
import { Modal } from 'react-bootstrap';
import { registerAdmin, searchUsers, deleteUser, messageUsers } from "../utils/api";
import { AuthContext } from "../utils/authContext.js";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import lightLogo from '../images/gem_logo.png';
import darkLogo from '../images/gem_logo_white.png';
import logo2 from '../images/gem-singlelogo.png';
import { FaSignOutAlt, FaArrowLeft, FaTrashAlt, FaEye, FaTimes } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip'
import '../styles/App.css';

function AdminRegister({}) {
    const { logout } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [first_name, setFirstName] = useState("");
    const [store_id, setStoreId] = useState("");
    const [last_name, setLastName] = useState("");
    const [error, setError] = useState("");
    const [error2, setError2] = useState("");
    const [error3, setError3] = useState("");
    const [loading, setLoading] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null); 
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
    const [logo, setLogo] = useState('../images/gem_logo.png');
    const theme = localStorage.getItem('theme');


    const stores = [
        { store_id: 1, store_name: "HQ" },
        { store_id: 2, store_name: "WH" },
        { store_id: 3, store_name: "AF" },
        { store_id: 4, store_name: "SF" },
        { store_id: 5, store_name: "OR" },
        { store_id: 6, store_name: "RD" },
        { store_id: 7, store_name: "SA" },
        { store_id: 8, store_name: "PC" },
        { store_id: 9, store_name: "LA" },
    ];

    const getStoreName = (store_id) => {
        const store = stores.find(store => store.store_id === store_id);
        return store ? store.store_name : "Unknown Store";
    };

    const navigate = useNavigate();

    const backButton = () => {
        navigate('/home');
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const showToast = (message, type = "success") => {
        toast(message, { type });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
    
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }
    
        try {
            await registerAdmin(email, password, first_name, last_name, store_id);
            showToast("Registration successful!", "success");
        } catch (err) {
            showToast("Error registering admin. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };


    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError2("");
        setSearchResults([]);

        try {
            const users = await searchUsers(searchQuery);

            if (users.length < 1) {
                setError2("No results found.");
            }
    
            setSearchResults(users);
        } catch (err) {
            showToast("Error searching users. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    }

    const openSearchResult = (userId) => {
        const user = searchResults.find((user) => user.id === userId);
        setSelectedUser(user);
        setIsModalOpen(true);
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    }

    const openDeleteModal = (userId) => {
        const user = searchResults.find((user) => user.id === userId);
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };
    
    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    };

    const handleDeleteUser = () => {
        if (userToDelete) {
            deleteUser(userToDelete.id)
                .then(() => {
                    showToast("User deleted successfully!", "success");
                    setSearchResults(searchResults.filter(user => user.id !== userToDelete.id)); 
                    setIsModalOpen(false); 
                    closeDeleteModal(); 
                })
                .catch((error) => {
                    showToast("Error deleting user. Please try again.", "error");
                });
        }
    };

    const handleMessage = async (e) => {
        e.preventDefault();
        setLoading2(true);
        setError3("");
        
        try {
            const response = await messageUsers(messageText);
    
            if (response) {
                showToast("Message sent successfully!", "success");
                setMessageText("");
            } else {
                showToast("Error sending message. Please try again.", "error");
            }
        } catch (err) {
            showToast("Error sending message. Please try again.", "error");
        } finally {
            setLoading2(false);
        }
    };

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        if (theme == 'light') {
        setLogo(lightLogo);
        } else if (theme == 'dark') {
        setLogo(darkLogo);
        }
    })


    return (
        <div className="container d-flex flex-column align-items-center vh-100">
            <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable
                pauseOnHover={false}
                theme={theme}
                transition={Bounce}
            />
            <nav className="profile-navbar">
                <FaArrowLeft className="react-icon" size={40} onClick={backButton}
                data-tooltip-id="back-tooltip"
                data-tooltip-content="Back"
                data-tooltip-delay-show={300}></FaArrowLeft>
                <img src={logo} alt="Logo" style={{ width: '375px', height: '86px' }} />
                <FaSignOutAlt className="react-icon" size={40} onClick={handleLogout}
                data-tooltip-id="logout-tooltip"
                data-tooltip-content="Logout"
                data-tooltip-delay-show={300}></FaSignOutAlt>
            </nav>
            <nav className="backup-profile-navbar pt-5 mb-1">
                <FaArrowLeft className="react-icon" size={30} onClick={backButton}
                data-tooltip-id="back-tooltip"
                data-tooltip-content="Back"
                data-tooltip-delay-show={300}></FaArrowLeft>
                <img src={logo2} alt="Logo" style={{ width: '91px', height: '91px' }} />
                <FaSignOutAlt className="react-icon" size={30} onClick={handleLogout}
                data-tooltip-id="logout-tooltip"
                data-tooltip-content="Logout"
                data-tooltip-delay-show={300}></FaSignOutAlt>
            </nav>
            <div className="register-div">
            <div className="register-admin-card" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="text-center mb-4">
                    {"Register An Admin"}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                        <>
                            <div className="mb-3">
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="First Name"
                                    value={first_name}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Last Name"
                                    value={last_name}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <select
                                    className="form-control"
                                    value={store_id}
                                    onChange={(e) => setStoreId(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select Store</option>
                                    {stores.map((store) => (
                                        <option key={store.store_id} value={store.store_id}>
                                            {store.store_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    <button 
                        type="submit" 
                        className="btn-2" 
                        disabled={loading}
                    >
                        {"Register"}
                    </button>
                </form>
                {error && <p className="text-danger text-center mt-2">{error}</p>}
            </div>
            <div className="register-admin-card" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="text-center mb-4">
                    {"Search Users"}
                </h2>
                <form onSubmit={handleSearch}>
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="btn-2" 
                        disabled={loading}
                    >
                        {"Search"}
                    </button>
                </form>

                {/* Display search results */}
                {loading ? (
                        <div className="loader-wrapper-2">
                        <div className="lds-ellipsis">
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                    ) : 
                searchResults.length > 0 && (
                    <div className="search-results">
                        <h4>Results:</h4>
                        <div className="search-div">
                            {searchResults.map((user) => (
                                <span key={user.id} className="search-results-span">
                                    <div><strong>{getStoreName(user.store_id)}</strong> - {user.first_name} {user.last_name}</div>
                                    <div>
                                    <button
                                        className="icon"
                                        onClick={() => {openSearchResult(user.id);}}
                                        data-tooltip-id="view-tooltip"
                                        data-tooltip-content="View"
                                        data-tooltip-delay-show={1000}
                                    >
                                    <FaEye />
                                    </button>
                                    <button
                                        className="icon"
                                        onClick={() => {openDeleteModal(user.id);}}
                                        data-tooltip-id="delete-tooltip"
                                        data-tooltip-content="Delete"
                                        data-tooltip-delay-show={1000}
                                    >
                                    <FaTrashAlt />
                                    </button>
                                    </div>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                {error2 && <p className="text-danger text-center mt-5">{error2}</p>}
            </div>

            <div className="register-admin-card" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="text-center mb-4">
                    {"Message Users"}
                </h2>
                <form onSubmit={handleMessage}>
                    <div className="mb-3">
                    <textarea
                        className="form-control"
                        placeholder="What would you like to say?"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        rows="3"
                        required
                    ></textarea>
                    </div>
                    <button 
                        type="submit" 
                        className="btn-2" 
                        disabled={loading}
                    >
                        {"Send"}
                    </button>
                </form>
                {loading2 ? (
                        <div className="loader-wrapper-2">
                        <div className="lds-ellipsis">
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                    ) : <div></div>}
                {error3 && <p className="text-danger text-center mt-5">{error3}</p>}
            </div>


            </div>
            <Tooltip id="logout-tooltip" />
            <Tooltip id="back-tooltip" />
            <Tooltip id="delete-tooltip" />
            <Tooltip id="view-tooltip" />
            <Modal
                show={isModalOpen}
                onHide={closeModal}
            >
                {selectedUser && (
                    <div>
                        <Modal.Header>
                            <Modal.Title>User Information</Modal.Title>
                            <FaTimes
                            className="close-modal-times"
                        onClick={() => {
                            closeModal();
                        }}
                    ></FaTimes>
                        </Modal.Header>
                        <Modal.Body>
                            <p><strong>User ID:</strong> {selectedUser.id}</p>
                            <p><strong>Name:</strong> {selectedUser.first_name} {selectedUser.last_name}</p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            <p><strong>Phone Number:</strong> {selectedUser.phone_number}</p>
                            <p><strong>Store:</strong> {getStoreName(selectedUser.store_id)}</p>
                        </Modal.Body>
                    </div>
                )}
            </Modal>
            <Modal
                show={isDeleteModalOpen}
                onHide={closeDeleteModal}
            >
                <Modal.Header>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                    <FaTimes
                        className="close-modal-times"
                        onClick={() => {
                            closeDeleteModal();
                        }}
                    ></FaTimes>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete <strong>{userToDelete?.first_name} {userToDelete?.last_name}</strong>?</p>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn-2" onClick={closeDeleteModal}>
                        Cancel
                    </button>
                    <button
                        className="btn-important"
                        onClick={handleDeleteUser}
                    >
                        Confirm Delete
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default AdminRegister;
