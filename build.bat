@echo off
setlocal enabledelayedexpansion
echo === Minifying sources ===
for /R ./src %%f in (*.*) do (
  set B=%%f
  set "p=build\!B:%CD%\src\=!"
  set "e=%%~xf"
  echo !p!
  if not exist "!p!\.." @mkdir "!p!/.."
  set "s=0"
  if "!e!"==".css" (set "s=1")
  if "!e!"==".js" (set "s=1")
  if "!s!"=="1" ( @java -jar yuicompressor-2.4.8.jar %%f -o "!p!" ) else ( copy /Y %%f "!p!" > NUL)
)
echo === Creating ZIP ===
cscript zip.vbs %CD%\release.zip new > NUL
for /f "delims=" %%D in ('dir build /b') do (
	cscript zip.vbs %CD%\release.zip add %CD%\build\%%D > NUL
	echo Added %%D to zip
)
echo === We're done! ===
pause