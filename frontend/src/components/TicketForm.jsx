import React, { useState, useEffect } from "react";
import { FaFileUpload, FaFileDownload, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../utils/authContext";
import { uploadImage, assignAdminToTicket, getAdmins } from "../utils/api";
import "bootstrap/dist/css/bootstrap.min.css";

function TicketForm({ selectedTicket, onSave }) {
  const [title, setTitle] = useState("");
  const [customDetail, setCustomDetail] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("Open");
  const [contactMethod, setContactMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [showImage, setShowImage] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const { user } = useAuth();

  const [ticketCategory, setTicketCategory] = useState("");
  const [ticketSubcategory, setTicketSubcategory] = useState("");

  const subOptions = {
    Hardware: [
      "Register",
      "Handheld Devices",
      "Workstations",
      "Printers",
      "Battery Backups",
      "Phones",
      "Cameras",
      "Music",
      "Other",
    ],
    Software: [
      "Network / Internet",
      "ECRS / Catapult",
      "Email",
      "30 60 90",
      "Other",
    ],
    "Password Reset Request": ["ECRS / Catapult", "Email", "Other"],
  };

  const handleCategoryChange = (e) => {
    const selected = e.target.value;
    setTicketCategory(selected);
    setTicketSubcategory("");
    setCustomDetail("");
    if (selected === "Other") {
      setTitle(`Other - `);
    } else {
      setTitle("");
    }
  };

  const handleSubcategoryChange = (e) => {
    const selected = e.target.value;
    setTicketSubcategory(selected);
    if (selected !== "Other") {
      setCustomDetail("");
      setTitle(`${ticketCategory} - ${selected}`);
    } else {
      setCustomDetail("");
      setTitle(`${ticketCategory} - Other - `);
    }
  };

  const handleCustomDetailChange = (e) => {
    const value = e.target.value;
    setCustomDetail(value);
    if (ticketCategory === "Other") {
      setTitle(`Other - ${value}`);
    } else if (ticketSubcategory === "Other") {
      setTitle(`${ticketCategory} - Other - ${value}`);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setFileName(file.name);

      try {
        const response = await uploadImage(file);
        const { image_url } = response;
        setImageUrl(image_url);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const handleDivClick = () => {
    document.getElementById("imageUpload").click();
  };

  const toggleImage = () => {
    setShowImage((prevShowImage) => !prevShowImage);
  };

  useEffect(() => {

    if (user?.role === "admin") {
      getAdmins()
        .then((data) => {
          setAdmins(data);
        })
        .catch((err) => {
          console.error("Failed to load admin list:", err);
        });
    }

    if (selectedTicket) {
      setSelectedAdminId(selectedTicket.assigned_employee?.toString() || "");
      const titleParts = selectedTicket.title.split(" - ");
      if (titleParts[0] === "Other") {
        setTicketCategory("Other");
        setTicketSubcategory("");
        setCustomDetail(titleParts.slice(1).join(" - "));
      } else {
        setTicketCategory(titleParts[0]);
        if (titleParts.length === 2) {
          setTicketSubcategory(titleParts[1]);
          setCustomDetail("");
        } else if (titleParts[1] === "Other") {
          setTicketSubcategory("Other");
          setCustomDetail(titleParts.slice(2).join(" - "));
        } else {
          setTicketSubcategory(titleParts[1] || "");
          setCustomDetail("");
        }
      }
      setTitle(selectedTicket.title);
      setDescription(selectedTicket.description);
      setSeverity(selectedTicket.severity);
      setStatus(selectedTicket.status);
      setContactMethod(selectedTicket.contact_method);
      setNotes("");
    } else {
      setTitle("");
      setDescription("");
      setSeverity("");
      setStatus("Open");
      setContactMethod("");
      setTicketCategory("");
      setTicketSubcategory("");
      setCustomDetail("");
    }
  }, [selectedTicket, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedDescription = notes
      ? `${description}\n\nUpdate:\n${notes}`
      : description;

    const ticketData = {
      title,
      description: updatedDescription,
      severity,
      status,
      contact_method: contactMethod,
    };

    if (imageUrl) {
      ticketData.image_url = imageUrl;
    }

    if (user?.role === "admin" && selectedTicket && selectedAdminId) {
      try {
        await assignAdminToTicket(selectedTicket.id, parseInt(selectedAdminId));
      } catch (err) {
        console.error("Error assigning admin on submit:", err);
      }
    }

    try {
      await onSave(ticketData);

      setTitle("");
      setDescription("");
      setSeverity("");
      setStatus("Open");
      setContactMethod("");
      setNotes("");
      setImage(null);
      setImageUrl(null);
      setTicketCategory("");
      setTicketSubcategory("");
      setCustomDetail("");
    } catch (error) {
      console.error("Error submitting ticket:", error);
      alert("Failed to submit the ticket. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 ticket-form">
      <div className="form-box w-100 d-flex flex-column align-items-center">
        <div className="title-form-box d-flex flex-column align-items-center">
          <div className="input-div">
          <label className="custom-label" htmlFor="ticketCategory">Category</label>
            <select
              className="form-select title-form-select-boxes select-box"
              value={ticketCategory}
              onChange={handleCategoryChange}
              required
            >
              <option value="" disabled>
                Select Category
              </option>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Password Reset Request">
                Password Reset Request
              </option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {ticketCategory === "Other" && (
          <div className="title-input-form-box d-flex flex-column align-items-center">
            <div className="input-div">
            <label className="custom-label" htmlFor="ticketCategory">Title</label>

              <input
                type="text"
                className="form-control input-box"
                placeholder="Title"
                value={customDetail}
                onChange={handleCustomDetailChange}
                maxLength={100}
                required
              />
            </div>
          </div>
        )}

        {ticketCategory && ticketCategory !== "Other" && (
          <div className="title-form-box d-flex flex-column align-items-center">
            <div className="input-div">
              <label className="custom-label" htmlFor="ticketCategory">Subcategory</label>
              <select
                className="form-select title-form-select-boxes select-box"
                value={ticketSubcategory}
                onChange={handleSubcategoryChange}
                required
              >
                <option value="" disabled>
                  Select Subcategory
                </option>
                {subOptions[ticketCategory]?.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {ticketSubcategory && (
              <div className="text-center">
                <a
                  href="https://docs.google.com/document/d/e/2PACX-1vT4q0E40LawciciDfBaNqL4cRGBDfT6p6SRfYHOuB9TYd127UII4jlBDO4icwcDSNFGo_HLXRpGlz5t/pub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-link"
                  style={{ fontWeight: "bold", color: "#7FAC6E", textDecoration: "underline", margin: "0"}}
                >
                  Self Troubleshooting Guide
                </a>
              </div>
            )}
          </div>
        )}


        {ticketSubcategory === "Other" && ticketCategory !== "Other" && (
          <div className="title-form-box d-flex flex-column align-items-center">
            <div className="input-div">
            <label className="custom-label" htmlFor="ticketCategory">Title</label>
              <input
                type="text"
                className="form-control input-box"
                placeholder="Title"
                value={customDetail}
                onChange={handleCustomDetailChange}
                maxLength={100}
                required
              />
            </div>
          </div>
        )}
      </div>

      <div className="form-box w-100 d-flex flex-column align-items-center">
        <div className="type-div">
        <label className="custom-label" htmlFor="ticketCategory">Description</label>
          <textarea
            className="form-control input-box"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{ height: "100px" }}
          />
        </div>
      </div>

      {user?.role === "admin" && (
        <div className="form-box w-100 d-flex flex-column align-items-center">
          <div className="type-div">
          <label className="custom-label" htmlFor="ticketCategory">Updates</label>
            <textarea
              className="form-control input-box"
              placeholder="Updates"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ height: "100px" }}
            />
          </div>
        </div>
      )}

      {!selectedTicket ? (
        <div className="input-form-box">
          <label className="custom-label" htmlFor="ticketCategory">Image</label>
          <div className="form-control image-upload" onClick={handleDivClick}>
            <input
              type="file"
              id="imageUpload"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            <span>Upload Image</span>
            <FaFileUpload />
          </div>
          {fileName && (
            <div className="file-name">Selected image: {fileName}</div>
          )}
        </div>
      ) : selectedTicket.image_url ? (
        <div>
          <div className="download-image">
            <a>Download Uploaded Image</a>
            <a href={selectedTicket.image_url}>
              <FaFileDownload className="react-icon" />
            </a>
          </div>
          <div className="url-image">
            <p>
              {selectedTicket.image_url.split("/").pop().split("?")[0]}
            </p>
            {showImage ? (
              <FaEye className="react-icon image-eye" onClick={toggleImage} />
            ) : (
              <FaEyeSlash className="react-icon image-eye" onClick={toggleImage} />
            )}
          </div>
          {showImage && (
            <div className="uploaded-image-div">
              <img
                src={selectedTicket.image_url}
                alt="Uploaded image not found"
              />
            </div>
          )}
        </div>
      ) : null}

      <div className="input-form-box d-flex flex-column align-items-center">
        <div className="input-div">
        <label className="custom-label" htmlFor="ticketCategory">Priority</label>
          <select
            className="form-select form-select-boxes select-box"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            required
          >
            <option value="" disabled>
              Select Priority
            </option>
            {selectedTicket ? (
              <>
                <option value={selectedTicket.severity} disabled>
                  {selectedTicket.severity.charAt(0).toUpperCase() +
                    selectedTicket.severity.slice(1)}
                </option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </>
            ) : (
              <>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </>
            )}
          </select>
        </div>
      </div>

      <div className="input-form-box d-flex flex-column align-items-center">
        <div className="input-div">
        <label className="custom-label" htmlFor="ticketCategory">Contact Method</label>
          <select
            className="form-select form-select-boxes select-box"
            value={contactMethod}
            onChange={(e) => setContactMethod(e.target.value)}
            required
          >
            <option value="" disabled>
              Contact Method
            </option>
            {selectedTicket ? (
              <>
                <option value={selectedTicket.contact_method} disabled>
                  {selectedTicket.contact_method}
                </option>
                <option value={user?.email}>{user?.email}</option>
                <option value={`Call - ${user?.phone_number}`}>
                  Call - {user?.phone_number}
                </option>
                <option value={`Text - ${user?.phone_number}`}>
                  Text - {user?.phone_number}
                </option>
                <option value="Google Chats">Google Chats</option>
                <option value="Store">Store</option>
              </>
            ) : (
              <>
                <option value={user?.email}>{user?.email}</option>
                <option value={`Call - ${user?.phone_number}`}>
                  Call - {user?.phone_number}
                </option>
                <option value={`Text - ${user?.phone_number}`}>
                  Text - {user?.phone_number}
                </option>
                <option value="Google Chats">Google Chats</option>
                <option value="Store">Store</option>
              </>
            )}
          </select>
        </div>
      </div>

      {user?.role === "admin" && selectedTicket && (
        <div className="input-form-box col-md-8 col-lg-4 w-100">
          <label className="custom-label">Assigned Employee</label>
          <select
            className="form-select form-select-boxes select-box"
            value={selectedAdminId || ""}
            onChange={(e) => setSelectedAdminId(e.target.value)}
            required
          >
            {selectedTicket.assigned_employee ? (
              <option value={selectedTicket.assigned_employee} disabled>
                {admins.find(a => a.id === selectedTicket.assigned_employee)
                  ? `${admins.find(a => a.id === selectedTicket.assigned_employee).first_name} ${admins.find(a => a.id === selectedTicket.assigned_employee).last_name}`
                  : "Loading..."}
              </option>
            ) : (
              <option value="" disabled>
                Unassigned
              </option>
            )}

            <option value="">Unassigned</option>
            {admins.map(admin => (
              <option key={admin.id} value={admin.id}>
                {admin.first_name} {admin.last_name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="input-form-box d-flex flex-column align-items-center">
        {user?.role === "admin" ? (
          <div className="input-form-box col-md-8 col-lg-4 w-100">
          <label className="custom-label" htmlFor="ticketCategory">Ticket Status</label>
            <select
              className="form-select form-select-boxes select-box"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="" disabled>
                Select Status
              </option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        ) : (
          <div className="input-form-box col-md-8 col-lg-4">
            <label className="custom-label" htmlFor="ticketCategory">Ticket Status</label>
            <input
              type="text"
              className="form-control form-select-boxes static-status"
              value={`${status}`}
              readOnly
            />
          </div>
        )}
      </div>

      <div className="d-flex justify-content-center">
        <div>
          <button type="submit" className="btn-important ticket-save">
            Submit
          </button>
        </div>
      </div>
    </form>
  );
}

export default TicketForm;
