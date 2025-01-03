@echo off
setlocal enabledelayedexpansion

:: Replace this with your extension path
set "EXTENSION_PATH=%~dp0extension"

:: Common locations to search for Chrome shortcuts
set "LOCATIONS[0]=%USERPROFILE%\Desktop"
set "LOCATIONS[1]=%USERPROFILE%\AppData\Roaming\Microsoft\Internet Explorer\Quick Launch\User Pinned\TaskBar"
set "LOCATIONS[2]=%APPDATA%\Microsoft\Windows\Start Menu\Programs"
set "LOCATIONS[3]=C:\ProgramData\Microsoft\Windows\Start Menu\Programs"
set "LOCATIONS[4]=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "LOCATIONS[5]=%USERPROFILE%\AppData\Roaming\Microsoft\Windows\Start Menu\Programs"
set "LOCATIONS[6]=%PUBLIC%\Desktop"

echo Searching for and modifying Chrome shortcuts...
echo Extension path: %EXTENSION_PATH%
echo.

:: Create VBScript to identify and modify Chrome shortcuts
echo Set objWS = WScript.CreateObject("WScript.Shell") > "%temp%\modifyShortcut.vbs"
echo Set objShortcut = objWS.CreateShortcut(WScript.Arguments(0)) >> "%temp%\modifyShortcut.vbs"
echo target = LCase(objShortcut.TargetPath) >> "%temp%\modifyShortcut.vbs"
echo If InStr(target, "chrome.exe") ^> 0 Then >> "%temp%\modifyShortcut.vbs"
echo     WScript.Echo "CHROME_SHORTCUT" >> "%temp%\modifyShortcut.vbs"
echo     If InStr(objShortcut.Arguments, "--load-extension") = 0 Then >> "%temp%\modifyShortcut.vbs"
echo         objShortcut.Arguments = objShortcut.Arguments ^& " --load-extension=%EXTENSION_PATH%" >> "%temp%\modifyShortcut.vbs"
echo         objShortcut.Save >> "%temp%\modifyShortcut.vbs"
echo         WScript.Echo "MODIFIED" >> "%temp%\modifyShortcut.vbs"
echo     Else >> "%temp%\modifyShortcut.vbs"
echo         WScript.Echo "ALREADY_MODIFIED" >> "%temp%\modifyShortcut.vbs"
echo     End If >> "%temp%\modifyShortcut.vbs"
echo Else >> "%temp%\modifyShortcut.vbs"
echo     WScript.Echo "NOT_CHROME" >> "%temp%\modifyShortcut.vbs"
echo End If >> "%temp%\modifyShortcut.vbs"

:: Process each location
for /L %%i in (0,1,6) do (
    echo.
    echo Checking directory: !LOCATIONS[%%i]!
    
    :: Change to the directory to properly handle spaces in paths
    pushd "!LOCATIONS[%%i]!"
    
    :: Find all .lnk files in current directory and subdirectories
    for /f "delims=" %%F in ('dir /b /s *.lnk 2^>nul') do (
        echo.
        echo Checking: "%%~nxF"
        for /f "tokens=1" %%a in ('cscript //nologo "%temp%\modifyShortcut.vbs" "%%F"') do (
            if "%%a"=="CHROME_SHORTCUT" (
                for /f "tokens=1" %%b in ('cscript //nologo "%temp%\modifyShortcut.vbs" "%%F"') do (
                    if "%%b"=="MODIFIED" (
                        echo     Modified Chrome shortcut: "%%~nxF"
                    ) else if "%%b"=="ALREADY_MODIFIED" (
                        echo     Skipped ^(already modified^): "%%~nxF"
                    )
                )
            ) else (
                echo     Skipped ^(not Chrome^): "%%~nxF"
            )
        )
    )
    
    :: Return to original directory
    popd
)

:: Clean up
del "%temp%\modifyShortcut.vbs"

echo.
echo Process completed