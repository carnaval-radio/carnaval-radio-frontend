# NextAuth.js Magic Links Setup Guide - Email-Only Authentication

This guide explains how to set up email-based authentication with magic links for Carnaval Radio.

## Architecture Overview

### How It Works
1. **Device Identification**: Each user device gets a unique device ID stored in localStorage
2. **Favorites Storage**: Favorites are stored in Supabase linked to the device ID
3. **Email Magic Links**: Users enter their email → get a link → instantly logged in
4. **Account Linking**: When logged in, device is linked to their account
5. **Cross-Device Sync**: All favorites from all linked devices are shown when logged in

### Why Magic Links?
- ✅ No passwords to manage
- ✅ No OAuth app setup needed
- ✅ Users just need email access
- ✅ Simple, fast, and secure
- ✅ Zero friction signup

### Database Schema

```
device_profiles (NEW)
├── id (UUID)
├── device_id (TEXT, UNIQUE) - Browser device identifier
├── user_id (UUID) - References auth.users(id)
└── linked_at (TIMESTAMP)

interactions (EXISTING - used for favorites)
├── user_id (TEXT) - Device ID or user ID
├── entity_id (UUID) - Reference to songs
├── type (TEXT) - 'like' for favorites
└── created_at (TIMESTAMP)
```

## Setup Steps

### 1. Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Copy the output and add it to your `.env.local`:

```
NEXTAUTH_SECRET=<generated-secret>
NEXTAUTH_URL=http://localhost:3000  # Change to your domain in production
```

### 2. Set Up Email SMTP

You need an SMTP provider to send emails. Options:

#### Option A: Gmail (Easiest for testing)
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable "Less secure app access" (if available) OR use "App Password"
3. Go to "App passwords" and generate one for "Mail" on "Windows Computer"
4. Copy the 16-character password
5. Add to `.env.local`:

```
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=<16-char app password>
EMAIL_FROM=noreply@your-domain.com
```

#### Option B: SendGrid (Recommended for production)
1. Sign up at [SendGrid](https://sendgrid.com)
2. Create an API key in Settings → API Keys
3. Add to `.env.local`:

```
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=<your-sendgrid-api-key>
EMAIL_FROM=noreply@carnaval-radio.nl
```

#### Option C: Mailgun (Alternative)
1. Sign up at [Mailgun](https://mailgun.com)
2. Get your SMTP credentials from domain settings
3. Add to `.env.local`:

```
EMAIL_SERVER_HOST=smtp.mailgun.org
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=<your-mailgun-email>
EMAIL_SERVER_PASSWORD=<your-mailgun-password>
EMAIL_FROM=noreply@carnaval-radio.nl
```

#### Option D: Custom SMTP Server
Use any SMTP server you have:

```
EMAIL_SERVER_HOST=smtp.your-provider.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-username
EMAIL_SERVER_PASSWORD=your-password
EMAIL_FROM=noreply@carnaval-radio.nl
```

### 3. Update Supabase Database

Run the new migration to create the `device_profiles` table:

```sql
-- Add to your Supabase SQL editor (already in supabase-schema.sql)

CREATE TABLE IF NOT EXISTS device_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_device_profiles_device_id ON device_profiles(device_id);
CREATE INDEX IF NOT EXISTS idx_device_profiles_user_id ON device_profiles(user_id);
```

### 4. Environment Variables (Complete `.env.local`)

```env
# NextAuth
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=http://localhost:3000

# Supabase (existing)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email SMTP (example: Gmail)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@carnaval-radio.nl
```

## How to Use

### For Users

**Without Account:**
- Users can add favorites as before
- Favorites are stored locally and in the database with their device ID

**With Account:**
1. Click "Sign in" in the sidebar/header
2. Enter their email
3. Check their inbox for a magic link (sent instantly)
4. Click the link → instantly logged in
5. Their device is automatically linked to their account
6. All favorites from all their linked devices appear immediately
7. Future favorites on any device are synced to their account

**Profile Page:**
- Visit `/profile` to see their account info
- Can sign out from here

### For Developers

#### Custom Hooks
- `useAuthSync()` - Automatically links device when user logs in
- Use in any client component to enable device syncing

#### API Endpoints
- `POST /api/auth/link-device` - Links current device to user account
- `GET /api/favorites/songs` - Returns favorites for user or device
- `POST /api/interactions/like` - Add/remove favorite

#### Session Usage
```typescript
import { useSession } from "next-auth/react";

export default function MyComponent() {
  const { data: session } = useSession();
  
  if (session?.user) {
    console.log("Logged in as:", session.user.email);
  }
}
```

## Troubleshooting

### "Failed to send verification email"
- Check SMTP credentials are correct
- Gmail: Make sure you used "App Password", not regular password
- Gmail: Enable "Less secure apps" if `NEXTAUTH_URL` is not HTTPS
- SendGrid: API key might be invalid
- Check firewall/network allows outgoing SMTP on port 587

### Users not receiving magic links
- Check spam/junk folder
- Verify EMAIL_FROM address is correct
- Test SMTP connection manually
- Check application logs for SMTP errors

### "Invalid redirect_uri" Error
- Make sure `NEXTAUTH_URL` matches exactly
- No trailing slashes
- Must use HTTPS in production

### Users not seeing cross-device favorites
- Check that `device_profiles` table exists in Supabase
- Verify the device was linked: Check `device_profiles` for an entry with the device_id
- Check browser console for any linking errors

### OAuth provider not showing (shouldn't appear)
- Magic links should be the only option
- If OAuth appears, check `auth.ts` file

### NEXTAUTH_URL error in production
- Make sure `NEXTAUTH_URL` is set to your production domain (without trailing slash)
- Example: `https://carnaval-radio.nl`

## Production Deployment

### Vercel
1. Add environment variables in Vercel project settings:
   - `NEXTAUTH_SECRET` - Generate new: `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Your production domain
   - Email SMTP variables
   - Supabase credentials
2. Deploy and test

### Other Hosting
1. Set all environment variables
2. Make sure `NEXTAUTH_URL` matches your domain exactly
3. Ensure SMTP port 587 is accessible
4. Rebuild and redeploy

## Files Modified/Created

### New Files
- `/lib/auth.ts` - NextAuth configuration with Email provider
- `/app/api/auth/[...nextauth]/route.ts` - Auth API routes
- `/app/api/auth/link-device/route.ts` - Device linking endpoint
- `/app/auth/signin/page.tsx` - Sign-in page
- `/app/auth/verify-email/page.tsx` - Email verification page
- `/app/auth/error/page.tsx` - Error page
- `/app/profile/page.tsx` - Profile page
- `/app/profile/ProfileClient.tsx` - Profile UI
- `/components/AuthButton.tsx` - Login button component
- `/components/RootClientComponent.tsx` - Root client wrapper
- `/hooks/useAuthSync.ts` - Auth sync hook

### Modified Files
- `/GlobalState/Providers.tsx` - Added SessionProvider
- `/app/favorites/songs/route.ts` - Added multi-device support
- `/app/layout.tsx` - Integrated RootClientComponent
- `/components/MobileHeader.tsx` - Added AuthButton
- `/components/Sidebar/SideBar.tsx` - Added AuthButton
- `/supabase-schema.sql` - Added device_profiles table
- `/.env.example` - Added email configuration

## Security Notes

1. **Never commit `.env.local`** - Keep secrets in `.env.local` only
2. **NEXTAUTH_SECRET** must be different for each environment
3. **Email credentials** should be from a service account
4. **Device linking** is automatic and transparent
5. **Session tokens** are JWT-based and secure
6. **Magic links** expire in 24 hours

## Performance Considerations

- Device linking is cached in the session
- Multiple device queries are optimized with indexes
- Favorite aggregation happens server-side
- Email sending is async (doesn't block)
- Minimal impact on existing queries

## Email Template Customization

The magic link email is sent from `/lib/auth.ts`. You can customize the HTML template in the `sendVerificationRequest` callback.

Example custom email:
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Welcome to Carnaval Radio! 🎉</h2>
  <p>Click the link below to sign in:</p>
  <p>
    <a href="${url}" style="background-color: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
      Sign In
    </a>
  </p>
</div>
```

## Future Enhancements

- [ ] Add optional social login (Google, Facebook, etc.) later
- [ ] Profile picture customization
- [ ] Favorite lists/playlists
- [ ] Social sharing of favorites
- [ ] Favorite statistics/analytics
- [ ] Account settings (notification preferences)
- [ ] Two-factor authentication
- [ ] Account recovery via backup codes

## Architecture Overview

### How It Works
1. **Device Identification**: Each user device gets a unique device ID stored in localStorage
2. **Favorites Storage**: Favorites are stored in Supabase linked to the device ID
3. **Account Linking**: When a user logs in, their device ID is linked to their account
4. **Cross-Device Sync**: All favorites from all linked devices are shown when logged in
5. **Non-Intrusive**: Users can add favorites without an account; they're synced if they later log in

### Database Schema

```
device_profiles (NEW)
├── id (UUID)
├── device_id (TEXT, UNIQUE) - Browser device identifier
├── user_id (UUID) - References auth.users(id)
└── linked_at (TIMESTAMP)

interactions (EXISTING - used for favorites)
├── user_id (TEXT) - Originally device_id, now can also be user_id
├── entity_id (UUID) - Reference to songs
├── type (TEXT) - 'like' for favorites
└── created_at (TIMESTAMP)
```

## Setup Steps

### 1. Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Copy the output and add it to your `.env.local`:

```
NEXTAUTH_SECRET=<generated-secret>
NEXTAUTH_URL=http://localhost:3000  # Change to your domain in production
```

### 2. Set Up OAuth Providers

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Select "Web application"
6. Add Authorized redirect URIs:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Copy Client ID and Client Secret
8. Add to `.env.local`:

```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

#### Facebook
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create an app (or select existing)
3. Add "Facebook Login" product
4. Go to Settings → Basic and copy App ID and App Secret
5. In Facebook Login Settings, add Valid OAuth Redirect URIs:
   - `http://localhost:3000/api/auth/callback/facebook`
   - `https://yourdomain.com/api/auth/callback/facebook`
6. Add to `.env.local`:

```
FACEBOOK_CLIENT_ID=your-app-id
FACEBOOK_CLIENT_SECRET=your-app-secret
```

#### Microsoft
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Name: "Carnaval Radio"
5. Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
6. Redirect URI: 
   - Platform: Web
   - URI: `http://localhost:3000/api/auth/callback/microsoft-entra-id`
7. Go to "Certificates & secrets" → "New client secret"
8. Copy the secret value (shown only once!)
9. Go to "Overview" and copy Application (client) ID
10. Add to `.env.local`:

```
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret
```

#### Apple
1. Go to [Apple Developer](https://developer.apple.com/)
2. Navigate to "Certificates, Identifiers & Profiles"
3. Under "Identifiers", register a new Service ID
4. Enable "Sign In with Apple"
5. Configure Web Configuration:
   - Primary Domain: `yourdomain.com`
   - Return URLs:
     - `http://localhost:3000/api/auth/callback/apple`
     - `https://yourdomain.com/api/auth/callback/apple`
6. Create a new private key for "Sign In with Apple"
7. Download the key and keep it safe
8. Add to `.env.local`:

```
APPLE_CLIENT_ID=your-service-id
APPLE_CLIENT_SECRET=your-client-secret (encoded private key format)
```

### 3. Update Supabase Database

Run the new migration to create the `device_profiles` table:

```sql
-- Add to your Supabase SQL editor (already in supabase-schema.sql)

CREATE TABLE IF NOT EXISTS device_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_device_profiles_device_id ON device_profiles(device_id);
CREATE INDEX IF NOT EXISTS idx_device_profiles_user_id ON device_profiles(user_id);
```

### 4. Environment Variables (Complete `.env.local`)

```env
# NextAuth
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=http://localhost:3000

# Supabase (existing)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OAuth Providers
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

FACEBOOK_CLIENT_ID=xxx
FACEBOOK_CLIENT_SECRET=xxx

MICROSOFT_CLIENT_ID=xxx
MICROSOFT_CLIENT_SECRET=xxx

APPLE_CLIENT_ID=xxx
APPLE_CLIENT_SECRET=xxx
```

## How to Use

### For Users

**Without Account:**
- Users can add favorites as before
- Favorites are stored locally and in the database with their device ID

**With Account:**
1. Click "Sign in" in the sidebar/header
2. Choose their provider (Google, Facebook, Microsoft, or Apple)
3. Authorize the app
4. Their device is automatically linked to their account
5. All favorites from all their linked devices appear immediately
6. Future favorites on any device are synced to their account

**Profile Page:**
- Visit `/profile` to see their account info
- Can sign out from here

### For Developers

#### Custom Hooks
- `useAuthSync()` - Automatically links device when user logs in
- Use in any client component to enable device syncing

#### API Endpoints
- `POST /api/auth/link-device` - Links current device to user account
- `GET /api/favorites/songs` - Returns favorites for user or device
- `POST /api/interactions/like` - Add/remove favorite

#### Session Usage
```typescript
import { useSession } from "next-auth/react";

export default function MyComponent() {
  const { data: session } = useSession();
  
  if (session?.user) {
    console.log("Logged in as:", session.user.email);
  }
}
```

## Troubleshooting

### "Invalid redirect_uri" Error
- Check that redirect URI in provider settings matches exactly: `NEXTAUTH_URL + /api/auth/callback/[provider]`
- Make sure trailing slashes match

### Users not seeing cross-device favorites
- Check that `device_profiles` table exists in Supabase
- Verify the device was linked: Check `device_profiles` for an entry with the device_id
- Check browser console for any linking errors

### OAuth provider not showing
- Verify all environment variables are set correctly
- Make sure `NEXTAUTH_SECRET` is set
- Restart development server after adding env vars

### NEXTAUTH_URL error in production
- Make sure `NEXTAUTH_URL` is set to your production domain (without trailing slash)
- Example: `https://carnaval-radio.nl`

## Production Deployment

### Vercel
1. Add environment variables in Vercel project settings
2. `NEXTAUTH_URL` will auto-set to your deployment URL
3. Generate new `NEXTAUTH_SECRET`: `openssl rand -base64 32`

### Other Hosting
1. Set all environment variables
2. Make sure `NEXTAUTH_URL` matches your domain exactly
3. Rebuild and redeploy

## Files Modified/Created

### New Files
- `/lib/auth.ts` - NextAuth configuration
- `/app/api/auth/[...nextauth]/route.ts` - Auth API routes
- `/app/api/auth/link-device/route.ts` - Device linking endpoint
- `/app/auth/signin/page.tsx` - Sign-in page
- `/app/auth/error/page.tsx` - Error page
- `/app/profile/page.tsx` - Profile page
- `/app/profile/ProfileClient.tsx` - Profile UI
- `/components/AuthButton.tsx` - Login button component
- `/components/RootClientComponent.tsx` - Root client wrapper
- `/hooks/useAuthSync.ts` - Auth sync hook

### Modified Files
- `/GlobalState/Providers.tsx` - Added SessionProvider
- `/app/favorites/songs/route.ts` - Added multi-device support
- `/app/layout.tsx` - Integrated RootClientComponent
- `/components/MobileHeader.tsx` - Added AuthButton
- `/components/Sidebar/SideBar.tsx` - Added AuthButton
- `/supabase-schema.sql` - Added device_profiles table
- `/.env.example` - Added OAuth environment variables

## Security Notes

1. **Never commit `.env.local`** - Keep secrets in `.env.local` only
2. **NEXTAUTH_SECRET** must be different for each environment
3. **OAuth secrets** should be rotated regularly
4. **Device linking** is automatic and transparent
5. **Session tokens** are JWT-based and secure

## Performance Considerations

- Device linking is cached in the session
- Multiple device queries are optimized with indexes
- Favorite aggregation happens server-side
- minimal impact on existing queries

## Future Enhancements

- [ ] Profile picture customization
- [ ] Favorite lists/playlists
- [ ] Social sharing of favorites
- [ ] Favorite statistics/analytics
- [ ] Account settings (notification preferences)
- [ ] Two-factor authentication
- [ ] Account recovery options
