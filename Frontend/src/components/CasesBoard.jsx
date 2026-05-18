import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateStatus } from '../features/casesSlice';

const statusColors = {
  'In Progress': '#60a5fa',
  Discovery: '#facc15',
  Closed: '#22c55e',
  'On Hold': '#f97316',
};

export function CasesBoard() {
  const cases = useSelector((state) => state.cases.items);
  const dispatch = useDispatch();

  const cycleStatus = (current) => {
    const order = ['In Progress', 'Discovery', 'On Hold', 'Closed'];
    const next = order[(order.indexOf(current) + 1) % order.length];
    return next;
  };

  return (
    <section id="cases" style={styles.section}>
      <div style={styles.header}>
        <h2>Cases</h2>
        <small>{cases.length} total</small>
      </div>
      <div style={styles.grid}>
        {cases.map((c) => (
          <div key={c.id} style={styles.card}>
            <div style={styles.cardTop}>
              <div>
                <div style={styles.title}>{c.title}</div>
                <div style={styles.meta}>{c.client} • {c.lawyer}</div>
              </div>
              <button
                style={{ ...styles.status, background: statusColors[c.status] ?? '#94a3b8' }}
                onClick={() => dispatch(updateStatus({ id: c.id, status: cycleStatus(c.status) }))}
              >
                {c.status}
              </button>
            </div>
            <p style={styles.summary}>{c.summary}</p>
            <div style={styles.footer}>
              <span>Next Hearing: {c.nextHearing}</span>
              <span style={styles.tags}>{c.tags.join(' • ')}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const styles = {
  section: { marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 },
  card: { padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  title: { fontWeight: 700, fontSize: 16 },
  meta: { color: '#475569', fontSize: 13 },
  summary: { margin: '8px 0', color: '#334155', fontSize: 14 },
  footer: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569', gap: 6, flexWrap: 'wrap' },
  status: { border: 'none', color: '#0f172a', padding: '6px 10px', borderRadius: 999, fontWeight: 700, cursor: 'pointer' },
  tags: { background: '#f8fafc', padding: '4px 8px', borderRadius: 6 },
};