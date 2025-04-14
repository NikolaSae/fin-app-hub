// components/services/ProviderStatistics.tsx


export function ProviderStatistics({ providers }) {
  if (!providers || providers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">Nema dostupnih podataka o provajderima.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium mb-4">Statistika Provajdera</h2>
      <ul>
        {providers.map((provider) => (
          <li key={provider.id} className="mb-2">
            <span className="font-bold">{provider.name}</span> - {provider.vasServices.length} VAS servisa,{" "}
            {provider.bulkServices.length} Bulk servisa, {provider.parkingServices.length} Parking servisa,{" "}
            {provider.humanServices.length} Human servisa.
          </li>
        ))}
      </ul>
    </div>
  );
}
