@echo off
set CONFIG_FILE=./extension/config.json

set USE_BIN=false
set BIN_URL=
set /p USE_BIN_INPUT="Use bin? (yes/no) [no]: "
if /i "%USE_BIN_INPUT%"=="y" set USE_BIN=true
if /i "%USE_BIN_INPUT%"=="yes" set USE_BIN=true

set TARGET_URL=
if "%USE_BIN%"=="true" (
    set /p BIN_URL="Enter bin URL: "
) else (
  set /p TARGET_URL="Enter target URL [http://localhost:3000]: "
  if "%TARGET_URL%"=="" set TARGET_URL=http://localhost:3000
)


echo {> "%CONFIG_FILE%"
echo   "targetUrl": "%TARGET_URL%",>> "%CONFIG_FILE%"
echo   "useBin": %USE_BIN%,>> "%CONFIG_FILE%"
echo   "binUrl": "%BIN_URL%">> "%CONFIG_FILE%"
echo }>> "%CONFIG_FILE%"
echo Config file created successfully at %CONFIG_FILE%!

@echo off
setlocal EnableDelayedExpansion

:: Configuration Section
set "SOURCE_FOLDER=./extension"
set "OUTPUT_DIR=./injector"
set "ZIP_NAME=extension.zip"

:: Validate source folder exists
if not exist "%SOURCE_FOLDER%" (
    echo Error: Source folder does not exist.
    echo Path: %SOURCE_FOLDER%
    goto :error
)

:: Validate output directory exists, create if it doesn't
if not exist "%OUTPUT_DIR%" (
    echo Output directory does not exist. Creating...
    mkdir "%OUTPUT_DIR%"
    if !errorlevel! neq 0 (
        echo Error: Failed to create output directory.
        goto :error
    )
)

:: Create the zip file using PowerShell
echo Creating zip file...
powershell -command "Compress-Archive -Path '%SOURCE_FOLDER%\*' -DestinationPath '%OUTPUT_DIR%\%ZIP_NAME%' -Force"

:: Check if zip was created successfully
if !errorlevel! neq 0 (
    echo Error: Failed to create zip file.
) else (
    echo Successfully created zip file: %OUTPUT_DIR%\%ZIP_NAME%
)

call .\injector\create-installer.bat
