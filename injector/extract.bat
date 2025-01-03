@echo off
setlocal

REM Use AppData\Local which is always available to the user
set "INSTALL_DIR=%LOCALAPPDATA%\chrome_extension"
echo Installing to: %INSTALL_DIR%

REM Create installation directory if it doesn't exist
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

REM Get the directory where this script is running
set "SCRIPT_DIR=%~dp0"
echo Working directory: %SCRIPT_DIR%

echo Extracting files...
powershell -command "Expand-Archive -Path '%SCRIPT_DIR%\extension.zip' -DestinationPath '%INSTALL_DIR%\extension' -Force"

echo Running post-install script...
copy "%SCRIPT_DIR%\post_install.bat" "%INSTALL_DIR%\post_install.bat"
cd "%INSTALL_DIR%"
call "post_install.bat"

echo Installation complete!
exit /b 0