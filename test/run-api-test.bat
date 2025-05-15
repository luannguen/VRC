@echo off
echo Opening VRC API Test Tool...

REM Try to find Chrome
set CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
set EDGE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe

REM Get the full path to the HTML file
set HTML_FILE=%~dp0api-test.html

REM Check which browser to use
if exist "%CHROME_PATH%" (
    echo Using Google Chrome
    start "" "%CHROME_PATH%" "%HTML_FILE%"
) else if exist "%EDGE_PATH%" (
    echo Using Microsoft Edge
    start "" "%EDGE_PATH%" "%HTML_FILE%"
) else (
    echo Opening with default browser
    start "" "%HTML_FILE%"
)

echo Test file opened. Make sure your backend server is running.
echo.
echo Press any key to exit...
pause > nul
