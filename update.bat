@echo off
chcp 65001 >nul
title Token Dashboard 一键更新

echo.
echo  ========================================
echo    Token Dashboard 一键更新部署
echo  ========================================
echo.
echo  1. 从 CoPaw 获取最新 token 数据
echo  2. 更新 src/token-data.ts
echo  3. 构建 + 部署到 Vercel
echo.

set /p TOKENS="上个月 token 总量 (e.g. 1500000): "
if "%TOKENS%"=="" goto :cancel
set /p CALLS="模型调用次数 (e.g. 4000): "
if "%CALLS%"=="" goto :cancel

echo.
echo  [-] 更新数据文件...
python deploy.py --edit src/token-data.ts TOTAL_TOKENS=%TOKENS% MODEL_CALLS=%CALLS%

echo.
echo  [-] 构建 + 部署到 Vercel...
python deploy.py --vercel

echo.
echo  ========================================
echo  部署完成! 等1-2分钟访问:
echo  https://token-dashboard-s18u.vercel.app
echo  ========================================
pause
exit /b 0

:cancel
echo.
echo  [!] 已取消
pause
