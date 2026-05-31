# Supabase setup — Servify (project: stvjosvtexdiuqgmikhl)
# Database is Supabase PostgreSQL via Prisma. This is the final configuration.

$PROJECT = "stvjosvtexdiuqgmikhl"
$POOLER  = "aws-1-ap-northeast-1.pooler.supabase.com"

Write-Host "=== Servify Supabase (final) ===" -ForegroundColor Cyan
Write-Host "Project ref: $PROJECT"
Write-Host "Dashboard:   https://supabase.com/dashboard/project/$PROJECT"
Write-Host ""
Write-Host "Required on Vercel AND .env.local:" -ForegroundColor Yellow
Write-Host "  DATABASE_URL  = postgresql://postgres.$PROJECT`:<password>@$POOLER`:6543/postgres?pgbouncer=true"
Write-Host "  DIRECT_URL    = postgresql://postgres.$PROJECT`:<password>@$POOLER`:5432/postgres"
Write-Host "  RESEND_API_KEY, RESEND_FROM_EMAIL"
Write-Host "  NEXT_PUBLIC_SUPABASE_URL = https://$PROJECT.supabase.co"
Write-Host ""
Write-Host "Copy exact values from .env.example (already filled for this project)."
Write-Host "After deploy: npm run db:push"
