import React from 'react';
import { useState } from 'react';
import Form01LoanModal from '../Form01LoanModal';
import LoanEditModal from '../LoanEditModal';

const LoanFormsTab = () => {
    const [isLoanModalOpen, setLoanModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState(null);

    const handleOpenLoanModal = () => {
        setLoanModalOpen(true);
    };

    const handleCloseLoanModal = () => {
        setLoanModalOpen(false);
    };

    const handleOpenEditModal = (loan) => {
        setSelectedLoan(loan);
        setEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setEditModalOpen(false);
        setSelectedLoan(null);
    };

    return (
        <div className="loan-forms-tab">
            <h2 className="text-lg font-semibold">Loan Management</h2>
            <button onClick={handleOpenLoanModal} className="btn btn-primary">
                Create New Loan
            </button>
            {/* Render loan list here */}
            {/* Example: <LoanList onEdit={handleOpenEditModal} /> */}

            <Form01LoanModal isOpen={isLoanModalOpen} onClose={handleCloseLoanModal} />
            <LoanEditModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} loan={selectedLoan} />
        </div>
    );
};

export default LoanFormsTab;