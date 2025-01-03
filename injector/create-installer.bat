@echo off
setlocal

REM Check if files.zip exists
if not exist "%~dp0\extension.zip" (
    echo Error: extension.zip not found
    exit /b 1
)

REM Check if post_install.bat exists
if not exist "%~dp0\post_install.bat" (
    echo Error: post_install.bat not found
    exit /b 1
)

REM Create the self-extracting exe
cd /D "%~dp0"
echo %CD%
powershell -Command "iexpress /n 'install_directive.sed'"

echo Installer created successfully as installer.exe
exit /b 0