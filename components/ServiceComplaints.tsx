// components/ServiceComplaints.tsx
export function ServiceComplaints({ complaints }) {
  if (complaints.length === 0) {
    return <div>No complaints</div>;
  }

  return (
    <div>
      <h3>Complaints</h3>
      <ul>
        {complaints.map((complaint) => (
          <li key={complaint.id}>
            <strong>{complaint.subject}</strong>
            <p>{complaint.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
