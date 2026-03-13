import os

file_path = "src/App.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the finance useEffect
old_finance = """  useEffect(() => {
    if (activeTab === 'earnings' || activeTab === 'history' || (activeTab === 'fleet' && role === 'consumer')) {"""

new_finance = """  useEffect(() => {
    if (view !== 'dashboard') return;
    if (activeTab === 'earnings' || activeTab === 'history' || (activeTab === 'fleet' && role === 'consumer')) {"""

content = content.replace(old_finance, new_finance)

# Also fix the tickets
old_tickets = """  useEffect(() => {
    if (activeTab === 'help' || activeTab === 'support') {"""

new_tickets = """  useEffect(() => {
    if (view !== 'dashboard') return;
    if (activeTab === 'help' || activeTab === 'support') {"""

content = content.replace(old_tickets, new_tickets)

# Also fix the schedule
old_schedule = """  useEffect(() => {
    if (activeTab === 'schedule' && role === 'producer') {"""

new_schedule = """  useEffect(() => {
    if (view !== 'dashboard') return;
    if (activeTab === 'schedule' && role === 'producer') {"""

content = content.replace(old_schedule, new_schedule)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Replaced successfully!")
