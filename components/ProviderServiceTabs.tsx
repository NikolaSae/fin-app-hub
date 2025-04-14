// components/ProviderServiceTabs.tsx
import { useState } from "react";
import { ServiceComplaints } from "./ServiceComplaints"; // Import the complaints component

export function ProviderServiceTabs({ provider }) {
  const [selectedTab, setSelectedTab] = useState("VAS");

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };

  // Function to render service names and complaints
  const renderServiceDetails = (services) => {
    return services.map((service) => (
      <div key={service.id}>
        <h4>{service.name}</h4>
        {/* Display complaints for each service */}
        <ServiceComplaints complaints={service.complaints} />
      </div>
    ));
  };

  return (
    <div>
      <div className="tabs">
        <button onClick={() => handleTabChange("VAS")}>VAS</button>
        <button onClick={() => handleTabChange("Bulk")}>Bulk</button>
        <button onClick={() => handleTabChange("Parking")}>Parking</button>
        <button onClick={() => handleTabChange("Human")}>Human</button>
      </div>
      <div>
        {selectedTab === "VAS" && renderServiceDetails(provider.vasServices)}
        {selectedTab === "Bulk" && renderServiceDetails(provider.bulkServices)}
        {selectedTab === "Parking" && renderServiceDetails(provider.parkingServices)}
        {selectedTab === "Human" && renderServiceDetails(provider.humanServices)}
      </div>
    </div>
  );
}
