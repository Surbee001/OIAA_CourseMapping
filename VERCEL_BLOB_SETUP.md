# Vercel Blob Storage Setup

This application now uses **Vercel Blob Storage** to persist application data in production.

## Required Environment Variable

Add this to your Vercel project environment variables:

```
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx
```

## How to Get the Token

### Option 1: Vercel Dashboard (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Create Store** → **Blob**
3. Create a new Blob store (any name, e.g., "applications-storage")
4. Vercel will automatically set the `BLOB_READ_WRITE_TOKEN` environment variable

### Option 2: Vercel CLI

```bash
vercel blob create applications-storage
```

This will automatically add the token to your project's environment variables.

## What Happens Without It?

If `BLOB_READ_WRITE_TOKEN` is not set:

- Applications will still be **accepted** (no errors to users)
- Application data will be logged to console (visible in Vercel logs)
- Data will **not be persisted** between requests
- Admin dashboard will show empty list

⚠️ **Make sure to set this variable before going live!**

## Local Development

For local testing, you can:

1. Copy the token from Vercel Dashboard → Settings → Environment Variables
2. Add it to your `.env.local` file:

```
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx
```

## Verifying It Works

After setting up:

1. Deploy or restart your Vercel project
2. Submit a test application
3. Check the admin dashboard - applications should appear
4. Check Vercel logs - you should see: `[Storage] Saved N applications to blob storage`

## Storage Details

- **File stored**: `applications-log.json` (stored in Vercel Blob)
- **Format**: JSON array of all applications
- **Access**: Public read (but URL is unguessable), write requires token
- **Limits**: 1TB total storage on Hobby plan

## Migration from Filesystem

The old filesystem-based storage (`data/applications-log.json`) is no longer used. All storage operations now use Vercel Blob.

If you had applications in the old system, they won't automatically migrate. Contact support if you need to transfer old data.

