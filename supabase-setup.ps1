# supabase-setup.ps1 — Option A project (stvjosvtexdiuqgmikhl)
# Get connection strings from: Supabase Dashboard → Project Settings → Database

Write-Host "Supabase project: stvjosvtexdiuqgmikhl"
Write-Host ""
Write-Host "Copy these into Vercel / .env.local:"
Write-Host "  DATABASE_URL  → Transaction pooler (port 6543, ?pgbouncer=true)"
Write-Host "  DIRECT_URL    → Direct / session pooler (port 5432)"
Write-Host "  NEXT_PUBLIC_SUPABASE_URL → https://stvjosvtexdiuqgmikhl.supabase.co"
Write-Host "  NEXT_PUBLIC_SUPABASE_ANON_KEY → API → anon public"
Write-Host "  SUPABASE_SERVICE_ROLE_KEY     → API → service_role"
Write-Host ""
Write-Host "Do NOT commit real passwords to git."
