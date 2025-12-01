@echo off
echo ========================================
echo   PDF Manager Pro - Starting...
echo ========================================
echo.
echo Opening PDF Manager in your browser...
echo.
echo The app will open at: http://localhost:8080
echo.
echo Keep this window open while using the app.
echo Press Ctrl+C to stop the server.
echo.
echo ========================================
echo.

cd /d "%~dp0"
start http://localhost:8080
python -m http.server 8080

pause
