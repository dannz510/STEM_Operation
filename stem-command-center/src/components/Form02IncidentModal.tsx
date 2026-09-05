import React, { useState } from 'react';
import Modal from 'react-modal';

const Form02IncidentModal = ({ isOpen, onRequestClose }) => {
  const [incidentDetails, setIncidentDetails] = useState({
    assetId: '',
    description: '',
    reportedBy: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIncidentDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic to handle incident reporting
    console.log('Incident reported:', incidentDetails);
    onRequestClose(); // Close the modal after submission
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} contentLabel="Report Incident">
      <h2>Report Incident</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="assetId">Asset ID:</label>
          <input
            type="text"
            id="assetId"
            name="assetId"
            value={incidentDetails.assetId}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={incidentDetails.description}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="reportedBy">Reported By:</label>
          <input
            type="text"
            id="reportedBy"
            name="reportedBy"
            value={incidentDetails.reportedBy}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Submit</button>
        <button type="button" onClick={onRequestClose}>Cancel</button>
      </form>
    </Modal>
  );
};

export default Form02IncidentModal;