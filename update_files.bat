@echo off
echo "Correcting bib export"
node citavi/index.js

echo "Pulling current state"

git pull
git add graphics/ *.drawio *.sh *.bib

echo "Added potential new graphics"

git status

echo "Commiting"

git commit -m "New file changes from local"
git push
echo "Changes are live"
