# ============================================================
#  TechAsset - Arranque completo del sistema
#  Levanta PostgreSQL + API (.NET) + Frontend (Vite)
#  Uso: clic derecho > "Ejecutar con PowerShell"
#       o en consola:  powershell -ExecutionPolicy Bypass -File .\iniciar-sistema.ps1
# ============================================================

$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$pgService = 'postgresql-x64-18'

Write-Host ''
Write-Host '  TechAsset - Iniciando sistema...' -ForegroundColor Cyan
Write-Host '  ---------------------------------------------' -ForegroundColor DarkGray

# ---------- 1) PostgreSQL ----------
$pg = Get-Service $pgService -ErrorAction SilentlyContinue
if (-not $pg) {
    Write-Host '  [!] No se encontro el servicio de PostgreSQL.' -ForegroundColor Yellow
}
elseif ($pg.Status -eq 'Running') {
    Write-Host '  [OK] PostgreSQL ya esta corriendo.' -ForegroundColor Green
}
else {
    Write-Host '  [..] Iniciando PostgreSQL...' -ForegroundColor Yellow
    try {
        Start-Service $pgService -ErrorAction Stop
        Write-Host '  [OK] PostgreSQL iniciado.' -ForegroundColor Green
    }
    catch {
        Write-Host '  [..] Se necesitan permisos de administrador.' -ForegroundColor Yellow
        Start-Process powershell.exe -Verb RunAs -Wait `
            -ArgumentList '-NoProfile', '-WindowStyle', 'Hidden', '-Command', "Start-Service $pgService"
        Start-Sleep -Seconds 3
        $pg = Get-Service $pgService -ErrorAction SilentlyContinue
        if ($pg.Status -eq 'Running') { Write-Host '  [OK] PostgreSQL iniciado.' -ForegroundColor Green }
        else { Write-Host '  [X] No se pudo iniciar PostgreSQL.' -ForegroundColor Red }
    }
}

# ---------- 2) API (backend .NET) ----------
$apiBusy = $false
try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $apiBusy = $tcp.ConnectAsync('127.0.0.1', 5264).Wait(800)
    $tcp.Close()
} catch { $apiBusy = $false }

if ($apiBusy) {
    Write-Host '  [OK] La API ya esta corriendo en el puerto 5264.' -ForegroundColor Green
}
else {
    Write-Host '  [..] Iniciando API en http://localhost:5264 ...' -ForegroundColor Yellow
    $apiCmd = @"
`$env:DOTNET_ROLL_FORWARD='LatestMajor'
`$env:ASPNETCORE_ENVIRONMENT='Development'
Set-Location '$root\backend'
Write-Host 'API TechAsset' -ForegroundColor Cyan
dotnet run --project TechAsset.API\TechAsset.API.csproj
"@
    Start-Process powershell.exe -ArgumentList '-NoExit', '-NoProfile', '-Command', $apiCmd | Out-Null
}

# ---------- 3) Frontend (Vite) ----------
$nodeModules = Join-Path $root 'frontend\node_modules'
if (-not (Test-Path $nodeModules)) {
    Write-Host '  [..] Instalando dependencias del frontend (solo la primera vez)...' -ForegroundColor Yellow
    Push-Location (Join-Path $root 'frontend')
    npm install
    Pop-Location
}

$webBusy = $false
try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $webBusy = $tcp.ConnectAsync('127.0.0.1', 5173).Wait(800)
    $tcp.Close()
} catch { $webBusy = $false }

if ($webBusy) {
    Write-Host '  [OK] El frontend ya esta corriendo en el puerto 5173.' -ForegroundColor Green
}
else {
    Write-Host '  [..] Iniciando frontend en http://localhost:5173 ...' -ForegroundColor Yellow
    $webCmd = @"
Set-Location '$root\frontend'
Write-Host 'Frontend TechAsset' -ForegroundColor Cyan
node '.\node_modules\vite\bin\vite.js'
"@
    Start-Process powershell.exe -ArgumentList '-NoExit', '-NoProfile', '-Command', $webCmd | Out-Null
}

# ---------- 4) Esperar y abrir navegador ----------
Write-Host '  [..] Esperando a que los servicios respondan...' -ForegroundColor Yellow
$ready = $false
for ($i = 1; $i -le 30; $i++) {
    Start-Sleep -Seconds 1
    try {
        $r = Invoke-WebRequest 'http://localhost:5173/' -UseBasicParsing -TimeoutSec 2
        if ($r.StatusCode -eq 200) { $ready = $true; break }
    } catch { }
}

Write-Host '  ---------------------------------------------' -ForegroundColor DarkGray
if ($ready) {
    Write-Host '  [LISTO] Aplicacion:  http://localhost:5173' -ForegroundColor Green
    Write-Host '  [LISTO] API:         http://localhost:5264' -ForegroundColor Green
    Write-Host '  [LISTO] Swagger:     http://localhost:5264/swagger' -ForegroundColor Green
    Write-Host ''
    Write-Host '  Credenciales de prueba:' -ForegroundColor Cyan
    Write-Host '    admin@innovatech.com        / Admin123*'
    Write-Host '    responsable@innovatech.com  / Responsable123*'
    Write-Host '    colaborador@innovatech.com  / Usuario123*'
    Start-Process 'http://localhost:5173/'
}
else {
    Write-Host '  [X] El frontend tardo demasiado. Revisa la ventana "Frontend TechAsset".' -ForegroundColor Red
}
Write-Host ''
Read-Host '  Presiona ENTER para cerrar esta ventana (los servicios siguen corriendo)'
