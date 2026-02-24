
Write-Host "Resetting Postgres User Password..." -ForegroundColor Cyan

# Check for admin privileges
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "You must run this script as Administrator!"
    exit
}

$pgPath = "C:\Program Files\PostgreSQL\17"
$dataDir = "$pgPath\data"
$hbaFile = "$dataDir\pg_hba.conf"
$backupFile = "$hbaFile.bak"

# 1. Stop Service
Write-Host "Stopping PostgreSQL service..."
net stop postgresql-x64-17

# 2. Backup pg_hba.conf
Copy-Item $hbaFile $backupFile -Force

# 3. Modify to Trust (temporarily)
# Read file
$content = Get-Content $hbaFile
# Replace scram-sha-256 with trust for local connections
# This is a simplified approach; assumes standard format
$newContent = $content -replace "host    all             all             127.0.0.1/32            scram-sha-256", "host    all             all             127.0.0.1/32            trust"
$newContent = $newContent -replace "host    all             all             ::1/128                 scram-sha-256", "host    all             all             ::1/128                 trust"
Set-Content $hbaFile $newContent

# 4. Start Service
Write-Host "Starting PostgreSQL service (Trust Mode)..."
net start postgresql-x64-17

# 5. Reset Password
Write-Host "Resetting password for user 'postgres' to 'Demo@1234'..."
& "$pgPath\bin\psql.exe" -U postgres -c "ALTER USER postgres WITH PASSWORD 'Demo@1234';"

# 6. Revert pg_hba.conf
Write-Host "Reverting pg_hba.conf..."
Copy-Item $backupFile $hbaFile -Force

# 7. Restart Service
Write-Host "Restarting PostgreSQL service (Secure Mode)..."
net stop postgresql-x64-17
net start postgresql-x64-17

Write-Host "Done! Password is now 'Demo@1234'" -ForegroundColor Green
Read-Host "Press Enter to exit"
