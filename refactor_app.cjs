const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');
const newDash = fs.readFileSync('new_dashboard.jsx', 'utf8');

const startIndex = content.indexOf('// [NEW] VIEW 3: CONSUMER DASHBOARD');
const endIndex = content.indexOf('// --- RETURN: LOGIN / SIGNUP / LANDING VIEW ---');

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find boundaries', startIndex, endIndex);
  process.exit(1);
}

const before = content.substring(0, startIndex);
// We want to add newDash and make sure 'after' starts with the login comment
const after = content.substring(endIndex);

content = before + newDash + '\n  ' + after;
fs.writeFileSync('src/App.jsx', content);
console.log('Successfully replaced!');
