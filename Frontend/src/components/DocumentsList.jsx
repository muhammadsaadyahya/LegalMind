import React from 'react';
import { useSelector } from 'react-redux';

export function DocumentsList() {
  const documents = useSelector((state) => state.documents.items);
  const cases = useSelector((state) => state.cases.items);
  const caseTitle = (caseId) => cases.find((c) => c.id === caseId)?.title ?? 'Unknown';

  return (
    <section id="documents" style={styles.section}>
      <div style={styles.header}>
        <h2>Documents</h2>
        <small>{documents.length} uploaded</small>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Case</th>
            <th>Type</th>
            <th>Uploaded By</th>
            <th>Date</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((d) => (
            <tr key={d.id}>
              <td>{d.title}</td>
              <td>{caseTitle(d.caseId)}</td>
              <td>{d.type}</td>
              <td>{d.uploadedBy}</td>
              <td>{d.uploadedAt}</td>
              <td>{d.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </section>
  );
}

const styles = {
  section: { marginTop: 16, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
};