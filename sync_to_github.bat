@echo off
cd /d C:\Users\Dell\Downloads\EcstasyRetreat

echo ---------------------------------------
echo Preparing to Sync Ecstasy Retreat...
echo ---------------------------------------

git init
git remote remove origin
git remote add origin https://github.com/VirtualWareCloud/EcstasyRetreat.git
git pull origin main

git add .
git commit -m "Automatic update from local Ecstasy Retreat folder"
git push origin main

echo ---------------------------------------
echo ✅ Sync Complete! Check your GitHub.
echo ---------------------------------------

pause
