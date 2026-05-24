# supabase-setup.ps1
# -------------------------------------------------
# *** WARNING: This script contains your DB password in an env var ***
# -------------------------------------------------
$env:SUPABASE_DB_PASSWORD = '$7c#WFuf6MFi*$S'   # your Postgres password

# 1️⃣ Login (public key)
supabase login --apikey sb_publishable_wIPnx0-d_ICEMnQJiMEd2A_BJgmfKLb

# 2️⃣ Initialise Supabase locally
supabase init

# 3️⃣ Link to remote project
supabase link --project-ref knmbejlcqytcktdqpvrb

# 4️⃣ Show the full connection string (for copy‑paste)
Write-Host "Postgres connection string:"
Write-Host "postgresql://postgres:$env:SUPABASE_DB_PASSWORD@db.knmbejlcqytcktdqpvrb.supabase.co:5432/postgres"
