@echo off
chcp 65001 > nul
title 启动独立历史-AI小说项目 (Antigravity)
echo ===================================================
echo   正在启动独立历史记录的 Antigravity IDE...
echo   项目路径: %~dp0
echo   独立历史数据目录: C:\Users\Administrator\.gemini\antigravity_novel_project
echo   自动编程端口: 9000 (已激活 Auto Accept)
echo ===================================================

:: 启动 Antigravity，携带调试端口及独立用户数据目录，并直接打开当前小说项目文件夹
start "" "D:\Antigravity\Antigravity.exe" --remote-debugging-port=9000 --user-data-dir="C:\Users\Administrator\.gemini\antigravity_novel_project" "%~dp0"

exit
