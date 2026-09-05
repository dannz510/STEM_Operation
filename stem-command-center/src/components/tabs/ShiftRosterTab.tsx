import React from 'react';
import { useState } from 'react';
import { Shift } from '../../types';

const ShiftRosterTab: React.FC = () => {
    const [shifts, setShifts] = useState<Shift[]>([]);

    const handleAddShift = (newShift: Shift) => {
        setShifts((prevShifts) => [...prevShifts, newShift]);
    };

    const handleDeleteShift = (shiftId: string) => {
        setShifts((prevShifts) => prevShifts.filter(shift => shift.id !== shiftId));
    };

    return (
        <div className="shift-roster-tab">
            <h2 className="text-lg font-semibold">Shift Roster</h2>
            <button onClick={() => handleAddShift({ id: 'new-shift', name: 'New Shift' })}>
                Add Shift
            </button>
            <ul>
                {shifts.map(shift => (
                    <li key={shift.id} className="flex justify-between items-center">
                        <span>{shift.name}</span>
                        <button onClick={() => handleDeleteShift(shift.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ShiftRosterTab;