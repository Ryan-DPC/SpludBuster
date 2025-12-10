@echo off
if not exist games\SpludBuster mkdir games\SpludBuster
move .env.exemple games\SpludBuster\
move .gitattributes games\SpludBuster\
move .github games\SpludBuster\
move .gitignore games\SpludBuster\
move LICENSE games\SpludBuster\
move README.md games\SpludBuster\
move assets games\SpludBuster\
move game.js games\SpludBuster\
move index.html games\SpludBuster\
move logo.png games\SpludBuster\
move main.js games\SpludBuster\
move manifest.json games\SpludBuster\
move package-lock.json games\SpludBuster\
move package.json games\SpludBuster\
move src games\SpludBuster\
del games\SpludBuster\placeholder.txt
