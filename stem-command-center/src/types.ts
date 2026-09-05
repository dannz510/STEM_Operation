// This file defines TypeScript types and interfaces used throughout the application.

export type Asset = {
    id: string;
    name: string;
    specs: string;
    serial: string;
    subTeam: string;
    location: string;
    value: number;
    status: 'IN_LAB' | 'ON_LOAN' | 'MAINT';
};

export type BorrowTicket = {
    id: string;
    assetId: string;
    assetName: string;
    borrowerName: string;
    borrowerUnit: string;
    borrowDate: string;
    dueDate: string;
    status: 'ON_LOAN' | 'RETURNED';
};

export type Member = {
    id: string;
    name: string;
    studentId: string;
    subTeam: string;
    role: 'CADET' | 'OPERATOR' | 'LEAD' | 'CHIEF';
    meritScore: number;
    demeritScore: number;
    status: 'READY' | 'ON_DUTY';
};

export type MeritDemeritLog = {
    id: string;
    memberId: string;
    memberName: string;
    subBranchCode: string;
    type: 'MERIT' | 'DEMERIT';
    points: number;
    ruleCode: string;
    reason: string;
    timestamp: string;
    recordedBy: string;
    loggedByName: string;
};

export type Shift = {
    id: string;
    leadOperatorId: string;
    cadetAssistantId: string;
    isCompleted: boolean;
};