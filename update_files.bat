@echo off

echo "Pulling current state"
git pull

if %errorlevel% neq 0 exit /b %errorlevel%

echo "Correcting bib export"
node citavi/index.js

if %errorlevel% neq 0 exit /b %errorlevel%

echo "Bewertungen"
node code/bewertungen/bewertung.js

if %errorlevel% neq 0 exit /b %errorlevel%

@REM echo "Plant UML"
@REM java -jar dependencies/plantuml.jar -nbthread auto -charset utf-8 -tpdf -o "../../graphics/" "./code/uml/" >NUL

@REM if %errorlevel% neq 0 exit /b %errorlevel%

echo "Adding changes"

git add graphics/ *.drawio *.sh *.bat *.bib content/04-produkte/vergleiche/ code/


git status

echo "Commiting"

git commit -m "New file changes from local"
git push || update_files.bat
echo "Changes are live"
