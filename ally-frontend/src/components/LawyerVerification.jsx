import React from 'react';
import LawyerVerificationTable from './LawyerVerificationTable';
import StatsOverview from './StatsOverview';

const LawyerVerification = () => {
  // Mock lawyer verification data
  const mockLawyerData = [
    {
      userId: "mock123",
      firstName: "Juan",
      lastName: "Dela Cruz",
      email: "juan.delacruz@example.com",
      phoneNumber: "(+63) 995 123 4567",
      address: "123 Bonifacio Street",
      city: "Cebu",
      province: "Cebu",
      zipCode: "6000",
      barNumber: "12345-PH-2020",
      specialization: [
        "Family Law",
        "Criminal Law",
        "Civil Litigation",
        "Corporate Law"
      ],
      yearsOfExperience: "8",
      createdAt: "2024-03-20",
      status: "pending",
      credentials: {
        name: "JuanDelaCruz_BarCertification.pdf",
        type: "application/pdf",
        size: "2.5 MB"
      },
      profilePhoto: null // Will use initial avatar
    },
    {
      userId: "mock124",
      firstName: "Maria",
      lastName: "Santos",
      email: "maria.santos@example.com",
      phoneNumber: "(+63) 995 234 5678",
      address: "456 Rizal Avenue",
      city: "Makati",
      province: "Metro Manila",
      zipCode: "1200",
      barNumber: "12346-PH-2018",
      specialization: [
        "Corporate Law",
        "Tax Law",
        "Intellectual Property",
        "Securities Law"
      ],
      yearsOfExperience: "12",
      createdAt: "2024-03-19",
      status: "approved",
      credentials: {
        name: "MariaSantos_LegalDocuments.pdf",
        type: "application/pdf",
        size: "3.1 MB"
      },
      profilePhoto: null
    },
    {
      userId: "mock125",
      firstName: "Pedro",
      lastName: "Reyes",
      email: "pedro.reyes@example.com",
      phoneNumber: "(+63) 995 345 6789",
      address: "789 Mabini Street",
      city: "Davao",
      province: "Davao del Sur",
      zipCode: "8000",
      barNumber: "12347-PH-2019",
      specialization: [
        "Immigration Law",
        "Labor Law",
        "Administrative Law",
        "Human Rights Law"
      ],
      yearsOfExperience: "10",
      createdAt: "2024-03-18",
      status: "rejected",
      credentials: {
        name: "PedroReyes_Certifications.pdf",
        type: "application/pdf",
        size: "1.8 MB"
      },
      profilePhoto: null
    },
    {
      userId: "mock126",
      firstName: "Ana",
      lastName: "Lim",
      email: "ana.lim@example.com",
      phoneNumber: "(+63) 995 456 7890",
      address: "321 Quezon Boulevard",
      city: "Manila",
      province: "Metro Manila",
      zipCode: "1000",
      barNumber: "12348-PH-2021",
      specialization: [
        "Real Estate Law",
        "Environmental Law",
        "Construction Law"
      ],
      yearsOfExperience: "5",
      createdAt: "2024-03-17",
      status: "pending",
      credentials: {
        name: "AnaLim_LegalCredentials.pdf",
        type: "application/pdf",
        size: "2.2 MB"
      },
      profilePhoto: null
    },
    {
      userId: "mock127",
      firstName: "Carlos",
      lastName: "Garcia",
      email: "carlos.garcia@example.com",
      phoneNumber: "(+63) 995 567 8901",
      address: "567 Luna Street",
      city: "Iloilo",
      province: "Iloilo",
      zipCode: "5000",
      barNumber: "12349-PH-2017",
      specialization: [
        "Maritime Law",
        "International Law",
        "Commercial Law",
        "Banking Law"
      ],
      yearsOfExperience: "15",
      createdAt: "2024-03-16",
      status: "pending",
      credentials: {
        name: "CarlosGarcia_Documents.pdf",
        type: "application/pdf",
        size: "2.7 MB"
      },
      profilePhoto: null
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Lawyer Verification</h1>
      </div>
      
      <StatsOverview />
      
      <div className="mt-8">
        <LawyerVerificationTable initialData={mockLawyerData} />
      </div>
    </div>
  );
};

export default LawyerVerification; 