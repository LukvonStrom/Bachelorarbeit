@echo off

echo "Pulling current state"
git pull

echo "Correcting bib export"
node citavi/index.js

echo "Bewertungen"
node code/bewertungen/bewertung.js

echo "Plant UML"
java -jar dependencies/plantuml.jar -tpdf -o "../../graphics/" "./code/uml/" >NUL

echo "Adding changes"

git add graphics/ *.drawio *.sh *.bat *.bib content/04-produkte/vergleiche/ code/


git status

echo "Commiting"

git commit -m "New file changes from local"
git push || update_files.bat
echo "Changes are live"
