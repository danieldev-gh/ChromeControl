[Version]
Class=IEXPRESS
SEDVersion=3
[Options]
PackagePurpose=InstallApp
ShowInstallProgramWindow=1
HideExtractAnimation=0
UseLongFileName=1
InsideCompressed=1
CAB_FixedSize=0
CAB_ResvCodeSigning=6144
RebootMode=N
InstallPrompt=%InstallPrompt%
DisplayLicense=.\license.txt
FinishMessage=%FinishMessage%
TargetName=%TargetName%
FriendlyName=%FriendlyName%
AppLaunched=%AppLaunched%
PostInstallCmd=%PostInstallCmd%
AdminQuietInstCmd=%AdminQuietInstCmd%
UserQuietInstCmd=%UserQuietInstCmd%
SourceFiles=SourceFiles
[Strings]
InstallPrompt=Are you sure you want to install this application?
DisplayLicense=
FinishMessage=Installation completed successfully
TargetName=.\installer.exe
FriendlyName=Application Installer
AppLaunched=cmd /c extract.bat
PostInstallCmd=<None>
AdminQuietInstCmd=
UserQuietInstCmd=
FILE0="extension.zip"
FILE1="extract.bat"
FILE2="post_install.bat"
[SourceFiles]
SourceFiles0=.\
[SourceFiles0]
%FILE0%=
%FILE1%=
%FILE2%=