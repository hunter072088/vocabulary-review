@echo off
chcp 65001 >nul
title VocabBuddy Local PWA Server
echo ========================================================
echo   🦉 VocabBuddy - 英語全方位學習系統 (支援一鍵安裝 APP)
echo   正在啟動本地伺服器 (Zero-Dependency Local Server)...
echo ========================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-server.ps1"
pause
