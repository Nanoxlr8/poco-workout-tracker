@echo off
chcp 65001 > nul
set PYTHONIOENCODING=utf-8
title Poco F5 Workout Tracker Server
cd /d "%~dp0"
echo ========================================================
echo   POCO F5 WORKOUT TRACKER - CALISTHENICS ^& STRENGTH
echo ========================================================
echo.
python serve.py
pause
