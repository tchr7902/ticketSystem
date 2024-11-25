import React, { useContext, useState } from 'react';
import { AuthContext } from '../utils/authContext';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSignOutAlt } from 'react-icons/fa';
import { ToastContainer, Bounce } from 'react-toastify';
import { Tooltip } from 'react-tooltip';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/App.css';
import logo from '../images/gem_logo.png';
import logo2 from '../images/gem-singlelogo.png';

const GuidesPage = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [filter, setFilter] = useState('');
    const [iframeSrc, setIframeSrc] = useState(
        'https://docs.google.com/document/d/e/2PACX-1vT4q0E40LawciciDfBaNqL4cRGBDfT6p6SRfYHOuB9TYd127UII4jlBDO4icwcDSNFGo_HLXRpGlz5t/pub?embedded=true#heading=h.oadzu9jhr0yn'
    );

    const sections = [
        { title: 'PinPad', url: 'https://docs.google.com/document/d/e/2PACX-1vS-VIHNoRcbeGXaMTULPTEoTmW-T8nsU1cVFqIRbaGmE4zL_9DjV6C1mG7Sca5mFtzoAzcHYZEGhJss/pub?embedded=true' },
        { title: 'Zebra Scanner', url: 'https://docs.google.com/document/d/e/2PACX-1vTj5unwX_ghj0o80tvKMu5mPC53SnGEP5UFknr2oZoviIckFCawqMNJ3VEKKI7boTZjkkadlKvKoljT/pub?embedded=true' },
        { title: 'Scale', url: 'https://docs.google.com/document/d/e/2PACX-1vTlqSSK8IQRVMW2-D_rI-CehjNYKFUaIf8F8tHg8wL9G2ek3oMzFxHYJBuLx9twpRimYri6rsUFDdBl/pub?embedded=true' },
        { title: 'Touchscreen', url: 'https://docs.google.com/document/d/e/2PACX-1vRIvmzLNnCHcuvh4D7Blh1PYHspdyyuS4TfUEWkOMuKT1eiMHFd4T2kAePIeKfs-c3kClOzuGzDo12a/pub?embedded=true' },
        { title: 'Fingerprint Scanner', url: 'https://docs.google.com/document/d/e/2PACX-1vQ38_biZm11bMLLsfr6niFc-rJ8aMxd4TqjlxPGDtjfRm-kCLNsoXEGUVbu9HyvVj3PS0C-a0rY1sD-/pub?embedded=true' },
        { title: 'Customer Display', url: 'https://docs.google.com/document/d/e/2PACX-1vTKVUiFqP2yCISnBH4Qzsk-7Cx8kP8tJ8vSgHo8ggL48YDvwgJ8dR0F1EfaDfKgmYRP_OoWMmPorzEH/pub?embedded=true' },
        { title: 'Receipt Printer', url: 'https://docs.google.com/document/d/e/2PACX-1vQfDWZFxXCI4G1zqzpS7-RpDF6mDlQ0X6kV5mGg9ZkLwS2QxBW3cWYl6uBXkfpFhilLI5VW93lnFxhR/pub?embedded=true' },
        { title: 'Battery Backup', url: 'https://docs.google.com/document/d/e/2PACX-1vQbKtR7JosHO_JB7G6768bKylOD5g-luSlhjw5kqc24YnaHj04rRVd1S_RTn8cNrkTN-xOz14SunwEP/pub?embedded=true' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const backButton = () => {
        navigate('/home');
    };
    

    const handleFilterChange = (e) => {
        const selectedTitle = e.target.value;
        setFilter(selectedTitle);

        const section = sections.find((sec) => sec.title === selectedTitle);
        if (section) {
            setIframeSrc(
                `${section.url}`
            );
        }
    };

    if (!user) {
        return (
            <div className="loader-wrapper">
                <div className="lds-ellipsis">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
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
                theme="light"
                transition={Bounce}
            />
            <nav className="profile-navbar">
                <FaArrowLeft
                    className="react-icon"
                    size={40}
                    onClick={backButton}
                    data-tooltip-id="back-tooltip"
                    data-tooltip-content="Back"
                    data-tooltip-delay-show={300}
                ></FaArrowLeft>
                <img src={logo} alt="Logo" style={{ width: '375px', height: '86px' }} />
                <FaSignOutAlt
                    className="react-icon"
                    size={40}
                    onClick={handleLogout}
                    data-tooltip-id="logout-tooltip"
                    data-tooltip-content="Logout"
                    data-tooltip-delay-show={300}
                ></FaSignOutAlt>
            </nav>
            <nav className="backup-profile-navbar">
                <FaArrowLeft
                    className="react-icon"
                    size={30}
                    onClick={backButton}
                    data-tooltip-id="back-tooltip"
                    data-tooltip-content="Back"
                    data-tooltip-delay-show={300}
                ></FaArrowLeft>
                <img src={logo2} alt="Logo" style={{ width: '91px', height: '91px' }} />
                <FaSignOutAlt
                    className="react-icon"
                    size={30}
                    onClick={handleLogout}
                    data-tooltip-id="logout-tooltip"
                    data-tooltip-content="Logout"
                    data-tooltip-delay-show={300}
                ></FaSignOutAlt>
            </nav>
            <div className="filter-guides">
                <h2 className="text-center mb-2">Search Guides</h2>
                <div className="filter-div">
                    <select
                        className="form-select form-select-boxes select-box"
                        value={filter}
                        onChange={handleFilterChange}
                        required
                    >
                        <option value="" disabled>
                            Filter
                        </option>
                        {sections.map((section) => (
                            <option key={section.title} value={section.title}>
                                {section.title}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="guides-result-div">
                    <iframe
                        id="guides-iframe"
                        src={iframeSrc}
                        title="Troubleshooting Guide"
                        width="100%"
                        height="1000"
                        style={{ border: 'none' }}
                        sandbox="allow-same-origin allow-scripts"
                    ></iframe>
                </div>
                <div className="guides-result-div-mobile">
                <button
                    onClick={() => window.open(iframeSrc, '_blank')}
                    className="btn-important"
                >
                    Open Guide
                </button>
                </div>
            </div>
            <Tooltip id="logout-tooltip" />
            <Tooltip id="back-tooltip" />
        </div>
    );
};

export default GuidesPage;
