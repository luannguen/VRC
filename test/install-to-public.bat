@echo off
echo Copying API Test files to backend public directory...

set SOURCE_DIR=%~dp0
set DEST_DIR=E:\Download\vrc\backend\public

if not exist "%DEST_DIR%" (
    mkdir "%DEST_DIR%"
    echo Created directory: %DEST_DIR%
)

REM Copy HTML test file
copy /Y "%SOURCE_DIR%api-test.html" "%DEST_DIR%\api-test.html"
copy /Y "%SOURCE_DIR%new-api-test.html" "%DEST_DIR%\new-api-test.html"

REM Copy JavaScript test files
copy /Y "%SOURCE_DIR%test-health.js" "%DEST_DIR%\test-health.js"
copy /Y "%SOURCE_DIR%test-header-info.js" "%DEST_DIR%\test-header-info.js"
copy /Y "%SOURCE_DIR%test-all-endpoints.js" "%DEST_DIR%\test-all-endpoints.js"
copy /Y "%SOURCE_DIR%test-new-endpoints-esm.js" "%DEST_DIR%\test-new-endpoints-esm.js"
copy /Y "%SOURCE_DIR%test-navigation.js" "%DEST_DIR%\test-navigation.js"
copy /Y "%SOURCE_DIR%test-products.js" "%DEST_DIR%\test-products.js"
copy /Y "%SOURCE_DIR%test-homepage.js" "%DEST_DIR%\test-homepage.js"

if %errorlevel% equ 0 (
    echo.
    echo Success! The API test files have been copied to:
    echo %DEST_DIR%
    echo.    echo You can now access the HTML test via: http://localhost:3000/api-test.html
    echo And run the JS tests with:
    echo   node %DEST_DIR%\test-health.js
    echo   node %DEST_DIR%\test-header-info.js
    echo   node %DEST_DIR%\test-all-endpoints.js [--endpoint=name]
    echo.
    echo (Make sure your backend server is running)
    echo.
) else (
    echo.
    echo Error copying files. Please check paths and permissions.
    echo.
)

echo Press any key to exit...
pause > nul
