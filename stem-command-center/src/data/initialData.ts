const initialData = {
  assets: [
    {
      id: 'ASSET-001',
      name: 'Laptop Dell XPS 13',
      specs: 'Intel i7, 16GB RAM, 512GB SSD',
      serial: 'D123456789',
      subTeam: 'IT',
      location: 'Lab 1',
      value: 1500,
      status: 'IN_LAB',
    },
    {
      id: 'ASSET-002',
      name: '3D Printer Prusa i3',
      specs: 'FDM, 0.4mm nozzle',
      serial: 'P987654321',
      subTeam: 'Engineering',
      location: 'Lab 2',
      value: 1200,
      status: 'IN_LAB',
    },
  ],
  members: [
    {
      id: 'MEMBER-001',
      name: 'Nguyễn Văn A',
      studentId: 'SV001',
      subTeam: 'IT',
      role: 'CHIEF',
      meritScore: 250,
      demeritScore: 10,
      status: 'READY',
    },
    {
      id: 'MEMBER-002',
      name: 'Trần Thị B',
      studentId: 'SV002',
      subTeam: 'Engineering',
      role: 'OPERATOR',
      meritScore: 150,
      demeritScore: 5,
      status: 'ON_DUTY',
    },
  ],
  loans: [],
  meritLogs: [],
};

export default initialData;