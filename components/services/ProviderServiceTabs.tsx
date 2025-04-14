// components/services/ProviderServiceTabs.tsx

"use client";
import React, { useState } from "react";

export function ProviderServiceTabs({ provider }) {
  const [selectedTab, setSelectedTab] = useState("VAS");

  const tabsConfig = [
    { key: "VAS", label: "VAS Servisi", services: provider.vasServices },
    { key: "Bulk", label: "Bulk Servisi", services: provider.bulkServices },
    { key: "Parking", label: "Parking Servisi", services: provider.parkingServices },
    { key: "Human", label: "Human Servisi", services: provider.humanServices },
  ];

  const activeTab = tabsConfig.find((tab) => tab.key === selectedTab);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">{provider.name} - Servisi</h2>
      <div className="flex space-x-2 border-b mb-4">
        {tabsConfig.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key)}
            className={`px-4 py-2 ${
              selectedTab === tab.key
                ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {activeTab?.services.length === 0 ? (
          <p className="text-gray-500">Nema servisa u ovoj kategoriji.</p>
        ) : (
          <ul className="space-y-2">
            {activeTab?.services.map((service) => (
              <li key={service.id} className="border rounded p-3">
                {service.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
