# Servify

Home services marketplace - [servify-dusky.vercel.app](https://servify-dusky.vercel.app)

## Database: Supabase

Servify uses **Supabase PostgreSQL** only. All data access goes through **Prisma** (`DATABASE_URL` + `DIRECT_URL`). Do not use Neon or other Postgres providers.

The active Supabase project is selected entirely by environment variables.

### Required environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Transaction pooler, port **6543**, `?pgbouncer=true` |
| `DIRECT_URL` | Yes | Session/direct pooler, port **5432**; must be set on Vercel |
| `RESEND_API_KEY` | Yes | Email verification OTP |
| `RESEND_FROM_EMAIL` | Yes | e.g. `noreply@servify.space` |
| `NEXT_PUBLIC_SUPABASE_URL` | Recommended | `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_APP_URL` | Production | Your Vercel URL on production |

### Not used by current app code

These are **not required** for login, signup, or bookings today:

- Clerk (`CLERK_*`): auth is custom via Prisma + cookies
- Cloudinary: planned next; optional until uploads are wired
- `NEXTAUTH_*`: not used

### Local setup

```bash
# Create .env.local with DATABASE_URL, DIRECT_URL, NEXT_PUBLIC_SUPABASE_URL, and RESEND_*
npm install
npm run db:push    # create tables on Supabase
npm run dev
```

### Vercel checklist

1. Add **`DATABASE_URL`** and **`DIRECT_URL`** from the same Supabase project
2. Add `RESEND_*` and `NEXT_PUBLIC_SUPABASE_URL`
3. Set `NEXT_PUBLIC_APP_URL` to your production domain
4. Redeploy after changing env vars

### Useful commands

```bash
npm run db:push      # sync schema to Supabase
npm run db:check     # verify connection + table counts
npm run db:studio    # Prisma Studio
```
