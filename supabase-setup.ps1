# Supabase setup helper for Servify.
# This script does not configure the app automatically; it prints the values/checklist
# you need when pointing local or Vercel environments at a Supabase project.

$envPath = ".env.local"
$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL

if (-not $supabaseUrl -and (Test-Path $envPath)) {
  $line = Get-Content $envPath | Where-Object { $_ -match "^\s*NEXT_PUBLIC_SUPABASE_URL\s*=" } | Select-Object -First 1
  if ($line) {
    $supabaseUrl = ($line -split "=", 2)[1].Trim().Trim('"').Trim("'")
  }
}

$project = ""
if ($supabaseUrl -match "^https://([^.]+)\.supabase\.co/?$") {
  $project = $Matches[1]
}

Write-Host "=== Servify Supabase setup ===" -ForegroundColor Cyan
if ($project) {
  Write-Host "Project ref: $project"
  Write-Host "Dashboard:   https://supabase.com/dashboard/project/$project"
} else {
  Write-Host "Project ref: not detected"
}

Write-Host ""
Write-Host "Required on Vercel AND .env.local:" -ForegroundColor Yellow
Write-Host "  DATABASE_URL              Supabase transaction pooler, port 6543, with ?pgbouncer=true"
Write-Host "  DIRECT_URL                Supabase session/direct connection, port 5432"
Write-Host "  NEXT_PUBLIC_SUPABASE_URL  https://<project-ref>.supabase.co"
Write-Host "  RESEND_API_KEY"
Write-Host "  RESEND_FROM_EMAIL"
Write-Host ""
Write-Host "After changing env vars, redeploy Vercel. For a new empty project, run: npm run db:push"
