@echo off
REM Test script for running new API endpoint tests
REM This will run the test-new-endpoints-esm.js script

echo ========================================
echo  RUNNING NEW API ENDPOINT TESTS
echo ========================================
echo.

REM Set the API base URL if it's not already set
if "%API_BASE_URL%"=="" (
  set API_BASE_URL=http://localhost:3000/api
)

echo Using API URL: %API_BASE_URL%
echo.

node test-new-endpoints-esm.js

if %ERRORLEVEL% NEQ 0 (
  echo.
  echo [ERROR] Tests failed with exit code %ERRORLEVEL%
  exit /b %ERRORLEVEL%
) else (
  echo.
  echo [SUCCESS] All tests passed successfully!
)
