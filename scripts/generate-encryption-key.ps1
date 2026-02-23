# Generate a 64-char hex key for APP_ENCRYPTION_KEY. Works in PowerShell 5.1 and older .NET.
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 32
$rng.GetBytes($bytes)
$hex = [System.BitConverter]::ToString($bytes) -replace '-', ''
Write-Host "Add this to your .env as APP_ENCRYPTION_KEY="
Write-Host $hex
