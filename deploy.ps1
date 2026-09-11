Write-Host '?? Starting SurviveFirst Production Deployment...'
Write-Host '1?? Checking Vercel CLI...'
npx --yes vercel whoami
if ($LASTEXITCODE -ne 0) {
    Write-Host '? You are not logged into Vercel. Please run ''npx vercel login'' first.'
    exit 1
}
Write-Host '2?? Deploying to Vercel Production...'
npx --yes vercel --prod
Write-Host '? Deployment Triggered! Don''t forget to add your Supabase URL and ANON_KEY to the Vercel environment variables dashboard.'
