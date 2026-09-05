# STEM-CT Setup Instructions

Developer: Dannz

This file is the step-by-step deployment and configuration guide. Keep secrets only in local environment variables or the hosting provider secret store.

## 1. Install and run locally

1. Open PowerShell in the project root.
2. Install packages:

```powershell
npm install
```

3. Copy the environment template:

```powershell
Copy-Item .env.example .env.local
```

4. Fill the required values in `.env.local`:
   - `GEMINI_API_KEY`: Gemini key, if Codex AI features are enabled.
   - `VITE_SUPABASE_URL`: Supabase project URL.
   - `VITE_SUPABASE_ANON_KEY`: Supabase publishable/anon key.
   - `APP_URL`: local URL, usually `http://127.0.0.1:3000`.
5. Start the app:

```powershell
npm run dev
```

If port 3000 is occupied, Vite selects the next available port. Use the URL printed in the terminal.

## 2. Apply the Supabase database

1. Open Supabase Dashboard and select the project.
2. Open **SQL Editor**.
3. Run these files in order:
   1. `supabase/migrations/0001_stem_lab_os.sql`
   2. `supabase/migrations/0002_firebase_identity.sql` if Firebase Auth will be used.
   3. `supabase/migrations/0003_grandmaster_rank.sql`.
4. In Supabase Auth, create and confirm the first email/password user.
5. Open `supabase/bootstrap_workspace.sql` locally.
6. Replace `YOUR_ADMIN_EMAIL` with the confirmed user email.
7. Run the edited bootstrap SQL in Supabase SQL Editor.
8. Verify that the user has:
   - `profiles.status = 'ACTIVE'`
   - A row in `workspace_memberships`
   - `workspace_memberships.role = 'ADMIN'`
9. Do not run migration files out of order.

## 3. Supabase Auth setup

1. Supabase Dashboard -> **Authentication** -> **Providers**.
2. Enable Email provider.
3. If using Supabase Google OAuth, enable Google and enter the Google Client ID and Secret.
4. In Google Cloud Console, use this Authorized redirect URI:

```text
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

5. In Supabase -> **Authentication** -> **URL Configuration**:
   - Local Site URL: `http://127.0.0.1:3000`
   - Local redirect URL: `http://127.0.0.1:3000/**`
   - Add the final Vercel URL after deployment.
6. If Google is not configured, use `Guest Mode (Local Demo)` to inspect the UI without creating a cloud session.

## 4. Firebase Auth setup (optional)

Firebase is an optional replacement for Supabase Auth. It is not enough to enter only an admin UUID. You need a Firebase Web configuration and a server-side Admin service account.

### 4.1 Firebase Console

1. Create or select a Firebase project.
2. Authentication -> Sign-in method:
   - Enable Google.
   - Enable Email/Password.
3. Project settings -> Your apps -> Web app.
4. Copy these values into `.env.local`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
5. Generate a Firebase Admin service account. Put its values only in the server environment:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
6. Never use `VITE_` for service-account values.

### 4.2 Run the local auth bridge

1. Set these server variables in the local environment:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - Firebase Admin variables listed above.
2. Start the bridge:

```powershell
npm run auth:dev
```

3. Set this browser variable in `.env.local`:

```env
VITE_AUTH_SYNC_URL=http://127.0.0.1:8787/api/auth/sync
```

4. Restart the Vite server after editing `.env.local`.
5. Firebase login flow is:
   - Browser signs in with Firebase.
   - Browser sends ID token to `/api/auth/sync`.
   - `server/firebaseAuthSync.ts` verifies the token.
   - Server checks `profiles.email` and `profiles.status = 'ACTIVE'`.
   - Server checks the workspace membership and returns the RBAC role.

The current database still uses Supabase profiles and memberships as the authorization source. Firebase is the identity provider; it does not bypass database status or RBAC.

## 5. Configure the supplied administrator

The administrator UUID `773a1bf5-fb66-49bc-ac24-883c2d8b7760` is a database profile identifier only. It does not replace:

- A confirmed Auth account.
- An ACTIVE profile.
- An ADMIN workspace membership.
- Firebase Admin service-account credentials.

Use the admin email in `supabase/bootstrap_workspace.sql`, not the UUID, when creating the first workspace owner.

## 6. Verify the setup

Run:

```powershell
npm run lint
npm run build
```

Check these behaviors manually:

- Email login accepts an ACTIVE account.
- An unregistered email is rejected.
- An inactive account is rejected.
- Google login does not redirect to a provider error.
- Guest Mode opens local demo data only.
- QR scanner opens and manual asset-code fallback works.
- Borrow/return updates the local flow.
- Task completion updates points.
- Schedule conflict detection blocks overlap.

## 7. Vercel deployment

1. Import the repository into Vercel.
2. Set the build command to `npm run build`.
3. Set the output directory to `dist` if Vercel asks for it.
4. Add browser-safe variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_FIREBASE_*` values if Firebase is enabled.
   - `VITE_AUTH_SYNC_URL` pointing to a deployed auth bridge, not localhost.
5. Add `GEMINI_API_KEY` only if the deployed app uses Gemini features.
6. Do not add `SUPABASE_SERVICE_ROLE_KEY` or Firebase private keys to browser variables.
7. Set Supabase and Firebase allowed redirect URLs to the final Vercel domain.
8. Redeploy after changing environment variables.

## 8. Troubleshooting

- `Unsupported provider`: enable the provider in Supabase or Firebase, or use email/Guest Mode.
- Tables return `404`: migration 0001 has not been executed, or PostgREST schema cache needs refresh.
- RPC is not found: execute the migration and wait briefly for schema cache refresh.
- PostgreSQL hostname cannot resolve: use Supabase SQL Editor or the Session Pooler connection string.
- Firebase login succeeds but app rejects user: check ACTIVE profile, workspace membership, and `VITE_AUTH_SYNC_URL`.
- Camera does not open: use HTTPS/localhost and grant browser camera permission.
- Environment changes appear ignored: restart Vite because environment variables are loaded at startup.
