$ErrorActionPreference = 'Stop'
$frontDir = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$rootDir = (Resolve-Path (Join-Path $frontDir '..')).Path
. (Join-Path $rootDir 'scripts\import-env.ps1') -Path (Join-Path $rootDir '.env')
. (Join-Path $rootDir 'scripts\import-env.ps1') -Path (Join-Path $frontDir '.env')

foreach ($key in @('SPRING_BOOT_API', 'AUTH_SECRET', 'AUTH_URL')) {
    if (-not [Environment]::GetEnvironmentVariable($key, 'Process')) {
        throw "Missing $key in the frontend .env"
    }
}

Push-Location $frontDir
try { & npm.cmd run dev; exit $LASTEXITCODE }
finally { Pop-Location }
