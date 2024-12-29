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