@echo off
echo Starting Next.js app...
set NEXT_SKIP_PAGES_VALIDATION=true
set NODE_OPTIONS=--no-warnings
npm run dev
