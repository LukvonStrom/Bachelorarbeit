#!/bin/bash
bg=`tput setaf 0 && tput setab 7` 
reset=`tput sgr 0`

echo "${bg}Correcting bib export${reset}"
node citavi/index.js

echo "${bg}Pulling current state${reset}"

git pull
git add graphics/ *.drawio *.sh *.bib

echo "${bg}Added potential new graphics${reset}"

git status

echo "${bg}Commiting${reset}"

git commit -m "New file changes from local"
git push
echo "${bg}Changes are live${reset}"
