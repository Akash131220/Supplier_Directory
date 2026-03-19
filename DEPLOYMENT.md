# Deployment Instructions (Vercel)

This application is built with Next.js and Supabase, making it perfectly optimized for deployment on Vercel.

## Prerequisites
1. A GitHub/GitLab/Bitbucket account with your code repository.
2. A Vercel account.
3. Your Supabase project with the SQL schema (`supabase/schema.sql`) executed in the SQL Editor.

## Step 1: Push Code to your Repository
1. Initialize a git repository if not done already:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
2. Push your code to a new repository on GitHub (or your preferred platform).

## Step 2: Deploy to Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** > **Project**.
3. Import the repository you just created.
4. **Environment Variables Config:** Before clicking Deploy, expand the "Environment Variables" section.
   Add the following variables exactly as they appear in your local `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` (Your Supabase Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Your Supabase Project API Anon Key)
5. Click **Deploy**.

## Step 3: Configure Supabase Auth Redirects
Once Vercel gives you your production URL (e.g., `https://supplier-directory.vercel.app`):
1. Go to your Supabase Project Dashboard.
2. Navigate to **Authentication** > **URL Configuration**.
3. Under **Site URL**, add your Vercel production URL.
4. Under **Redirect URLs**, add your Vercel production URL.

## Step 4: Create Admin Users
Since sign-ups are disabled/restrictive in real procurement scenarios, you should create Admin users directly inside the Supabase Dashboard:
1. Go to **Authentication** > **Users** in Supabase.
2. Click **Add user** > **Create new user**.
3. Enter the email and password for the admin.
4. Distribute the credentials. These admins can now log in at `https://your-site.vercel.app/admin/login` and add suppliers.

Your modern, scalable Supplier Directory is now fully deployed!
