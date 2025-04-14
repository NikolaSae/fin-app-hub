// components/services/ServiceComplaints.tsx
import React, { useState } from "react";

type ComplaintType = {
  id: string;
  subject: string;
  body: string;
  createdAt: Date;
  status: string;
};

type ServiceComplaintsProps = {
  complaints: ComplaintType[];
};

export function ServiceComplaints({ complaints }: ServiceComplaintsProps) {
  const [expandedComplaintId, setExpandedComplaintId] = useState<string | null>(null);
  
  // Status boje za reklamacije
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Funkcija za formatiranje datuma
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Funkcija za prikazivanje detalja reklamacije
  const toggleComplaintDetails = (complaintId: string) => {
    if (expandedComplaintId === complaintId) {
      setExpandedComplaintId(null);
    } else {
      setExpandedComplaintId(complaintId);
    }
  };
  
  if (complaints.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded text-gray-500 text-sm">
        Nema reklamacija za ovaj servis
      </div>
    );
  }
  
  return (
    <div>
      <h5 className="text-sm font-semibold text-gray-500 mb-2">Reklamacije:</h5>
      <div className="space-y-2">
        {complaints.map((complaint) => (
          <div key={complaint.id} className="border rounded">
            <div
              className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleComplaintDetails(complaint.id)}
            >
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(complaint.status)}`}>
                  {complaint.status}
                </span>
                <span className="text-sm font-medium">{complaint.subject}</span>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <span className="mr-2">{formatDate(complaint.createdAt)}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    expandedComplaintId === complaint.id ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            
            {expandedComplaintId === complaint.id && (
              <div className="p-4 border-t">
                <p className="text-gray-700 text-sm whitespace-pre-line">{complaint.body}</p>
                <div className="mt-3 text-xs text-gray-500">
                  ID reklamacije: {complaint.id}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}