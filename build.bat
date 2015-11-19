
setlocal enabledelayedexpansion
for /R ./src %%f in (*.*) do (
  set B=%%f
  set "p=build\!B:%CD%\src\=!"
  echo !p!
  if not exist "!p!\.." mkdir "!p!/.."
  java -jar yuicompressor-2.4.8.jar %%f -o "!p!"
)
pause

