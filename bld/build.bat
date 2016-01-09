@echo off
setlocal enabledelayedexpansion
echo === Copy build files ===
echo D | xcopy /s/e/y "..\src" "in"
echo === Minifying sources ===
for /R ./in %%f in (*.*) do (
  set B=%%f
  set "p=bin\build\!B:%CD%\in\=!"
  set "e=%%~xf"
  echo !p!
  if not exist "!p!\.." @mkdir "!p!/.."
  set "s=0"
  if "!e!"==".css" (set "s=1")
  if "!e!"==".js" (set "s=1")
  if "!s!"=="1" ( @java -jar res\yuicompressor-2.4.8.jar %%f -o "!p!" ) else ( copy /Y %%f "!p!" > NUL)
)
echo === Creating ZIP ===
cscript res\zip.vbs %CD%\bin\release.zip new > NUL
for /f "delims=" %%D in ('dir bin\build /b') do (
	cscript res\zip.vbs %CD%\bin\release.zip add %CD%\bin\build\%%D > NUL
	echo Added %%D to zip
)
echo === We're done! ===
pause