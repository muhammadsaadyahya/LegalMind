import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { sendMessage } from '../features/chatSlice';

export function ChatPanel() {
  const [text, setText] = useState('');
  const [caseId, setCaseId] = useState('case-1');
  const messages = useSelector((state) => state.chat.messages.filter((m) => m.caseId === caseId));
  const dispatch = useDispatch();

  const handleSend = () => {
    if (!text.trim()) return;
    dispatch(sendMessage({ caseId, from: 'Client', to: 'Lawyer', text }));
    setText('');
  };

  return (
    <section id="chat" style={styles.section}>
      <div style={styles.header}>
        <h2>Chat</h2>
        <select value={caseId} onChange={(e) => setCaseId(e.target.value)} style={styles.select}>
          <option value="case-1">Case 1</option>
          <option value="case-2">Case 2</option>
        </select>
      </div>
      <div style={styles.messages}>
        {messages.map((m) => (
          <div key={m.id} style={styles.message}>
            <div style={styles.messageMeta}>
              <strong>{m.from}</strong> → {m.to}{' '}
              <span style={styles.timestamp}>{new Date(m.timestamp).toLocaleString()}</span>
            </div>
            <div>{m.text}</div>
          </div>
        ))}
      </div>
      <div style={styles.composer}>
        <input
          style={styles.input}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button style={styles.send} onClick={handleSend}>Send</button>
      </div>
    </section>
  );
}

const styles = {
  section: { marginTop: 16, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  messages: { minHeight: 120, maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, padding: 6, background: '#f8fafc', borderRadius: 8 },
  message: { padding: 8, borderRadius: 8, background: '#fff', border: '1px solid #e2e8f0' },
  messageMeta: { fontSize: 12, color: '#475569', marginBottom: 4 },
  timestamp: { marginLeft: 6, color: '#94a3b8' },
  composer: { display: 'flex', gap: 8 },
  input: { flex: 1, padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' },
  select: { padding: 6, borderRadius: 6, border: '1px solid #cbd5e1' },
  send: { padding: '10px 14px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 },
};