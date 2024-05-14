@echo off

for /f "tokens=*" %%a in ('"%JAVA_HOME%\bin\java.exe" -version 2^>^&1') do (
  for /f "tokens=3" %%b in ('echo %%a ^| find /V "JDK_JAVA_OPTIONS" ^| find "version"') do (
    set j_ver=%%b
  )
)

set j_ver=%j_ver:"=%
set JVM_OPENS=

for /f "delims=.-_" %%j in ("%j_ver%") do (
  if /I "%%j" EQU "17" (
    set /p JVM_OPENS=<"%_PRG_DIR%java-opens.txt"
  )
)

set JAVA_OPTS=%JVM_OPENS% %JAVA_OPTS%
