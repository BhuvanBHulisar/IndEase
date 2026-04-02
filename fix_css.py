import os

path = 'src/App.css'
with open(path, 'r', encoding='utf-8') as f:
    data = f.read()

marker = '.verified-badge-expert'
idx = data.rfind(marker)
if idx == -1:
    print("Marker not found")
    exit(1)

# Find the next }
end_idx = data.find('}', idx)
if end_idx == -1:
    print("Closing brace not found")
    exit(1)

# Keep up to }
clean_data = data[:end_idx+1]

# Append new CSS
new_css = """
/* 8. DIAGNOSIS MODAL STYLES */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease-out;
}

.diagnosis-modal {
  background: white;
  width: 600px;
  max-width: 90%;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}

.modal-header-v2 {
  padding: 20px 30px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
}

.modal-header-v2 h3 { margin: 0; color: var(--navy-dark); font-size: 1.25rem; }

.modal-body-v2 {
  padding: 30px;
  max-height: 70vh;
  overflow-y: auto;
}

.upload-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: 0.3s;
  background: #f8fafc;
}

.upload-zone:hover {
  border-color: var(--navy-primary);
  background: #f1f5f9;
}

.upload-icon { font-size: 3rem; color: #94a3b8; margin-bottom: 15px; }
.upload-text { font-weight: 600; color: var(--navy-dark); margin-bottom: 5px; }
.upload-hint { color: #64748b; font-size: 0.85rem; }

/* Analysis Animation */
.scanning-container {
  text-align: center;
  padding: 40px 0;
}

.scanner-ring {
  width: 80px;
  height: 80px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid var(--navy-primary);
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* Expert Results */
.expert-result-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 10px;
  transition: 0.2s;
  cursor: pointer;
}

.expert-result-card:hover { border-color: var(--navy-primary); background: #f0f9ff; }
.expert-result-card.selected { border-width: 2px; border-color: var(--sage-green); background: #f0fdf4; }

.expert-avatar {
  width: 50px;
  height: 50px;
  background: var(--navy-dark);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.expert-info { flex: 1; }
.expert-info h4 { margin: 0; font-size: 1rem; color: var(--navy-dark); }
.expert-info p { margin: 2px 0 0; font-size: 0.8rem; color: #64748b; }

.match-score {
  font-size: 0.75rem;
  font-weight: 800;
  background: #dcfce7;
  color: var(--sage-green);
  padding: 4px 8px;
  border-radius: 6px;
}

/* 9. CHAT & MESSAGE SYSTEM */
.messages-view {
  display: flex;
  height: calc(100vh - 140px);
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.messages-sidebar {
  width: 300px;
  border-right: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
}

.chat-search-bar { padding: 15px; border-bottom: 1px solid #f1f5f9; }

.chat-list { flex: 1; overflow-y: auto; }

.chat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  cursor: pointer;
  transition: 0.2s;
  border-left: 4px solid transparent;
}

.chat-item:hover { background: #f8fafc; }
.chat-item.active { background: #f0f9ff; border-left-color: var(--navy-primary); }

.chat-avatar {
  width: 40px; height: 40px;
  background: #cbd5e1;
  border-radius: 50%;
  border: 2px solid white;
}

.chat-info { flex: 1; }
.chat-name { font-weight: 700; font-size: 0.9rem; color: var(--navy-dark); margin: 0; }
.chat-preview { font-size: 0.75rem; color: #64748b; margin: 2px 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
.chat-time { font-size: 0.7rem; color: #94a3b8; }

.chat-window { flex: 1; display: flex; flex-direction: column; background: #f8fafc; }

.chat-header {
  padding: 15px 20px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.9rem;
  line-height: 1.4;
  position: relative;
}

.message-bubble.received {
  background: white;
  border: 1px solid #e2e8f0;
  color: var(--navy-dark);
  border-bottom-left-radius: 2px;
  align-self: flex-start;
}

.message-bubble.sent {
  background: var(--navy-primary);
  color: white;
  border-bottom-right-radius: 2px;
  align-self: flex-end;
}

.message-time {
  font-size: 0.65rem;
  opacity: 0.7;
  display: block;
  margin-top: 5px;
  text-align: right;
}

.chat-input-area {
  padding: 20px;
  background: white;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 10px;
}

.chat-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
}
.chat-input:focus { border-color: var(--navy-primary); }

/* SPECIAL INVOICE MESSAGE */
.invoice-message-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: #f8fafc;
  margin-top: 5px;
}

.invoice-header {
  background: var(--navy-dark);
  color: white;
  padding: 8px 12px;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  justify-content: space-between;
}

.invoice-body { padding: 12px; }
.invoice-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.85rem; color: #475569; }
.invoice-total { display: flex; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #cbd5e1; font-weight: 800; color: var(--navy-dark); }

.btn-pay-now {
  width: 100%;
  background: var(--sage-green);
  color: white;
  border: none;
  padding: 8px;
  margin-top: 10px;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
}
.btn-pay-now:hover { background: #15803d; }
"""

with open(path, 'w', encoding='utf-8') as f:
    f.write(clean_data + new_css)

print("CSS Fixed.")
