@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"
echo Ligando o servidor de historias da Lumi...
echo Deixe esta janela aberta enquanto estiver usando o contador de historias.
echo Para desligar, feche esta janela.
echo.
node index.js
pause
