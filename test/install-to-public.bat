@echo off
echo Copying API Test file to backend public directory...

set SOURCE_FILE=%~dp0api-test.html
set DEST_DIR=E:\Download\vrc\backend\public
set DEST_FILE=%DEST_DIR%\api-test.html

if not exist "%DEST_DIR%" (
    mkdir "%DEST_DIR%"
    echo Created directory: %DEST_DIR%
)

copy /Y "%SOURCE_FILE%" "%DEST_FILE%"

if %errorlevel% equ 0 (
    echo.
    echo Success! The API test file has been copied to:
    echo %DEST_FILE%
    echo.
    echo You can now access it via: http://localhost:3000/api-test.html
    echo (Make sure your backend server is running)
    echo.
) else (
    echo.
    echo Error copying file. Please check paths and permissions.
    echo.
)

echo Press any key to exit...
pause > nul
