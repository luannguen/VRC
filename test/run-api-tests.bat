@echo off
REM Script to run all API tests
echo VRC API Testing Suite
echo ==============================================
echo.

echo This script will run all API tests and open the API test page in your browser.
echo.

set BACKEND_URL=http://localhost:3000
set TEST_DIR=%~dp0

echo 1. First, checking if backend is running...
curl -s --head %BACKEND_URL%/api/health > nul
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Backend server is not running!
    echo Please start the backend server at %BACKEND_URL% first.
    echo.
    echo To start the backend server:
    echo   1. Open a new terminal
    echo   2. Navigate to: E:\Download\vrc\backend
    echo   3. Run: npm run dev
    echo.
    echo Then run this script again.
    echo.
    goto end
)

echo Backend is running! Proceeding with tests...
echo.

echo 2. Installing test files to backend public directory...
call "%TEST_DIR%install-to-public.bat"
echo.

echo 3. Running health endpoint test...
node "%TEST_DIR%test-health.js"
echo.

echo 4. Running header-info endpoint test...
node "%TEST_DIR%test-header-info.js"
echo.

echo 5. Running comprehensive API test...
node "%TEST_DIR%test-all-endpoints.js"
echo.

echo 6. Opening API test page in browser...
start "" "%BACKEND_URL%/api-test.html"
echo.

echo ==============================================
echo All tests completed!
echo The API test page has been opened in your browser.
echo You can run individual tests with:
echo   - node test-health.js
echo   - node test-header-info.js
echo   - node test-all-endpoints.js [--endpoint=name]
echo ==============================================

:end
echo.
echo Press any key to exit...
pause > nul
