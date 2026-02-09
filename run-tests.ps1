#!/usr/bin/env pwsh
Write-Host "Running tests at $(Get-Date)" -ForegroundColor Cyan
npx vitest run --reporter=verbose
$exitCode = $LASTEXITCODE
Write-Host "Tests completed with exit code: $exitCode" -ForegroundColor $(if ($exitCode -eq 0) { 'Green' } else { 'Red' })
exit $exitCode
