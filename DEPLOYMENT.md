# 🚀 Being Suites - Deployment Guide

## FREE Deployment to Vercel

This project is designed for **completely FREE deployment** using:
- **Frontend**: Vercel (FREE tier)
- **Backend**: Supabase (FREE tier)

### 📋 Prerequisites
- GitHub account
- Vercel account (free)
- Supabase project (already configured)

### 🔧 Deployment Steps

#### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. **CRITICAL**: Configure environment variables in Vercel dashboard:
   - Go to Settings > Environment Variables
   - Add these **EXACT** variables:
     - `VITE_SUPABASE_URL`: `https://kdluvyhsnohagnumkbwd.supabase.co`
     - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbHV2eWhzbm9oYWdudW1rYndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NjIzNjUsImV4cCI6MjA3ODQzODM2NX0.ff9aMDp_NL0lAr3rEUnaO0ZfpBUj3_4ZV_AzgGGZnz0`
     - `VITE_ADMIN_PASSWORD`: `admin123`
   - **Important**: Make sure there are no extra spaces or characters
6. Click "Deploy"
7. **After deployment**: Check the live site for any environment variable errors

#### 3. Custom Domain (Optional)
- Add your custom domain in Vercel dashboard
- Vercel provides free SSL certificates

### 🎯 What Gets Deployed

**Frontend (Vercel):**
- React application
- Static files and assets
- Automatic builds on git push

**Backend (Supabase - Already Running):**
- PostgreSQL database
- Authentication system
- Real-time subscriptions
- Auto-generated API

### 💰 Cost Breakdown

**Total Monthly Cost: $0** 🎉

- **Vercel FREE tier**: 100GB bandwidth, unlimited projects
- **Supabase FREE tier**: 500MB database, 2GB bandwidth, 50K users

### 🔐 Admin Access

After deployment, access admin panel at:
- URL: `https://your-app.vercel.app/admin`
- Email: `admin@beingsuites.com`
- Password: `chbeing2020`

### 🔄 Automatic Updates

- Push to GitHub → Vercel automatically rebuilds and deploys
- Database changes → Apply via Supabase dashboard or migrations

### 📊 Monitoring

**Vercel Dashboard:**
- Deployment status
- Performance analytics
- Error logs

**Supabase Dashboard:**
- Database usage
- API requests
- Authentication logs

### 🚨 Important Notes

1. **Environment Variables**: Never commit `.env` file to GitHub
2. **Database Security**: RLS policies are already configured
3. **Scaling**: Both platforms auto-scale within free limits
4. **Backups**: Supabase provides automatic backups

### 🆘 Troubleshooting

**"Failed to execute 'fetch' on 'Window': Invalid value" Error:**
- This means environment variables are not set correctly in production
- Check Vercel dashboard > Settings > Environment Variables
- Ensure all three variables are set exactly as shown above
- Redeploy after adding variables

**Build Fails:**
- Check environment variables in Vercel
- Verify Supabase connection
- Check build logs for specific errors

**Admin Login Issues:**
- Confirm admin user exists in Supabase Auth
- Check RLS policies
- Verify environment variables are loaded (check browser console)

**Database Errors:**
- Monitor Supabase logs
- Verify API key permissions

**Environment Variables Not Loading:**
- Variables must start with `VITE_` for Vite to include them
- Check browser developer tools > Console for validation messages
- Ensure no extra spaces in variable names or values
- Check RLS policies

**Database Errors:**
- Monitor Supabase logs
- Verify API key permissions

---

**🎉 Your booking system is now live and completely FREE!**