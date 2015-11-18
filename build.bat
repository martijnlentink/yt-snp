setlocal enabledelayedexpansion
for /R ./src %%f in (*) do (
  set B=%%f
  if not exist "build\!B:%CD%\src\=!\.." mkdir "build\!B:%CD%\src\=!\.."
  java -jar yuicompressor-2.4.8.jar %f% -o "build\!B:%CD%\src\=!\.."
)
pause