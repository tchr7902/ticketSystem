import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../utils/authContext';
import { useNavigate } from 'react-router-dom';
import { getUserTickets, updateUser } from '../utils/api';
import { ToastContainer, Bounce } from 'react-toastify';
import { toast } from 'react-toastify';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaUser, FaArrowLeft, FaSignOutAlt, FaPencilAlt, FaTimes } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/App.css';
import lightLogo from '../images/gem_logo.png';
import darkLogo from '../images/gem_logo_white.png';
import logo2 from '../images/gem-singlelogo.png';

const ProfilePage = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [logo, setLogo] = useState('../images/gem_logo.png');
    const [tickets, setTickets] = useState({ open: 0, inProgress: 0, closed: 0 });
    const [loading, setLoading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [editFormData, setEditFormData] = useState({});


    const showToast = (message, type = "success") => {
        toast(message, { type });
    };

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
        store_id = Number(store_id); // Ensure it's a number
        const store = stores.find(store => store.store_id === store_id);
        return store ? store.store_name : "Unknown Store";
    };
    

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const backButton = () => {
        navigate('/home');
    };

    const handleEdit = () => {
        setEditFormData({ ...formData });
        setShowEditModal(true);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await updateUser(user.id, editFormData);
            setFormData({ ...editFormData }); 
            showToast("Profile updated successfully!");
            setShowEditModal(false)
        } catch (error) {
            showToast(error.message || "Failed to update profile.", "error");
        } finally {
            setLoading(false);
        }
    };
    

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value });
    };

    const handlePhoneNumberChange = (e) => {
        let input = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
        if (input.length > 10) input = input.slice(0, 10); // Limit to 10 digits
    
        let formatted = input;
        if (input.length > 6) {
            formatted = `(${input.slice(0, 3)}) ${input.slice(3, 6)}-${input.slice(6)}`;
        } else if (input.length > 3) {
            formatted = `(${input.slice(0, 3)}) ${input.slice(3)}`;
        } else if (input.length > 0) {
            formatted = `(${input}`;
        }
    
        // Update formData state with formatted phone number
        setFormData((prevData) => ({
            ...prevData,
            phone_number: formatted,
        }));
    };

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        console.log(theme)
        if (theme == 'light') {
        setLogo(lightLogo);
        console.log(logo)
        } else if (theme == 'dark') {
        setLogo(darkLogo);
        console.log(logo)
        }
        if (user) {
            setFormData({
                first_name: user.first_name,
                last_name: user.last_name,
                phone_number: user.phone_number,
                store_id: user.store_id,
            });

            const fetchUserTickets = async () => {
                try {
                    const data = await getUserTickets(user.id);
                    setTickets({
                        open: data.Open || 0,
                        inProgress: data["In Progress"] || 0,
                        closed: data.Closed || 0,
                    });
                } catch (error) {
                    showToast(error.message || "Error fetching tickets", "error");
                }
            };
            fetchUserTickets();
        }
    }, [user]);


    if (!user) return (
        <div className="loader-wrapper">
            <div className="lds-ellipsis">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    );

    return (
        <div className="container mt-5">
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable
                pauseOnHover={false}
                theme="light"
                transition={Bounce}
            />
            <nav className="profile-navbar">
                <FaArrowLeft className="react-icon" size={40} onClick={backButton}
                    data-tooltip-id="back-tooltip"
                    data-tooltip-content="Back"
                    data-tooltip-delay-show={300} />
                <img src={logo} alt="Logo" style={{ width: '375px', height: '86px' }} />
                <FaSignOutAlt className="react-icon" size={40} onClick={handleLogout}
                    data-tooltip-id="logout-tooltip"
                    data-tooltip-content="Logout"
                    data-tooltip-delay-show={300} />
            </nav>
            <nav className="backup-profile-navbar">
                <FaArrowLeft className="react-icon" size={30} onClick={backButton}
                    data-tooltip-id="back-tooltip"
                    data-tooltip-content="Back"
                    data-tooltip-delay-show={300} />
                <img src={logo2} alt="Logo" style={{ width: '91px', height: '91px' }} />
                <FaSignOutAlt className="react-icon" size={30} onClick={handleLogout}
                    data-tooltip-id="logout-tooltip"
                    data-tooltip-content="Logout"
                    data-tooltip-delay-show={300} />
            </nav>
            <div className="my-info">
                <FaUser className="profile-icon" />
                <h1>Hello, {user.first_name}!</h1>
                <p className="p-profile">{formData.first_name} {formData.last_name}</p>
                <p className="p-profile">{user.email}</p>
                <p className="p-profile">{formData.phone_number}</p>
                <p className="p-profile">{getStoreName(formData.store_id)}</p>
                <FaPencilAlt 
                className="react-icon mt-2"
                onClick={handleEdit}
                data-tooltip-id="edit-user-tooltip"
                data-tooltip-content="Edit Profile"
                data-tooltip-delay-show={300}/>
            </div>
            <div className="my-tickets">
                {user.role === "user" && (
                    <div>
                        <h3>My Ticket Status</h3>
                        <div className="ticket-status-numbers">
                            <p><strong>Open: </strong>{tickets.open}</p>
                            <p><strong>In Progress: </strong>{tickets.inProgress}</p>
                            <p><strong>Closed: </strong>{tickets.closed}</p>
                        </div>
                    </div>
                )}
            </div>
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header>
                    <Modal.Title>Edit Profile</Modal.Title>
                    <FaTimes
                        className="close-modal-times"
                        onClick={() => {
                            setShowEditModal(false);
                        }}
                    ></FaTimes>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="first_name">
                            <Form.Label className="edit-user-label">First Name</Form.Label >
                            <Form.Control
                                type="text"
                                name="first_name"
                                value={editFormData.first_name}
                                onChange={handleInputChange}
                                className="edit-user-div"
                            />
                        </Form.Group>
                        <Form.Group controlId="last_name">
                            <Form.Label className="edit-user-label">Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="last_name"
                                value={editFormData.last_name}
                                onChange={handleInputChange}
                                className="edit-user-div"
                            />
                        </Form.Group>
                        <Form.Group controlId="phone_number">
                            <Form.Label className="edit-user-label">Phone Number</Form.Label>
                            <Form.Control
                                type="text"
                                name="phone_number"
                                value={editFormData.phone_number}
                                onChange={handlePhoneNumberChange}
                                className="edit-user-div"
                            />
                        </Form.Group>
                        <Form.Group controlId="store_id">
                            <Form.Label className="edit-user-label">Store</Form.Label>
                            <Form.Select
                                name="store_id"
                                value={editFormData.store_id}
                                onChange={handleInputChange}
                                className="edit-user-div"
                            >
                                {stores.map(store => (
                                    <option key={store.store_id} value={store.store_id}>
                                        {store.store_name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn-2" onClick={() => setShowEditModal(false)}>
                        Cancel
                    </button>
                    <button className="btn-important" onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </Modal.Footer>
            </Modal>
            <Tooltip id="logout-tooltip" />
            <Tooltip id="back-tooltip" />
            <Tooltip id="edit-user-tooltip" />
        </div>
    );
};

export default ProfilePage;
