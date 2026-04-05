@echo off
REM WhiteNoise Pro v2.0 一键部署脚本

cd /d C:\Users\PC\.copaw\workspaces\default\projects\WhiteNoise-PWA

echo ========================================
echo WhiteNoise Pro v2.0 部署到 GitHub
echo ========================================
echo.

REM 设置 Git 配置
git config http.sslverify false
git config http.postBuffer 104857600
git config protocol.version 2

echo [1/3] 添加文件...
git add -A
git commit -m "v2.0 重构完成 - 界面优化 + 功能增强" || echo "没有新更改"

echo [2/3] 推送到 GitHub...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo [OK] 部署成功！
    echo ========================================
    echo.
    echo GitHub Pages 链接：
    echo https://Dlume.github.io/WhiteNoise-Pro-PWA/
    echo.
) else (
    echo.
    echo ========================================
    echo [ERROR] 推送失败
    echo ========================================
    echo.
    echo 请手动执行以下命令：
    echo cd C:\Users\PC\.copaw\workspaces\default\projects\WhiteNoise-PWA
    echo git push origin main
    echo.
)

pause
