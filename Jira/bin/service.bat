@echo off
rem Licensed to the Apache Software Foundation (ASF) under one or more
rem contributor license agreements.  See the NOTICE file distributed with
rem this work for additional information regarding copyright ownership.
rem The ASF licenses this file to You under the Apache License, Version 2.0
rem (the "License"); you may not use this file except in compliance with
rem the License.  You may obtain a copy of the License at
rem
rem     http://www.apache.org/licenses/LICENSE-2.0
rem
rem Unless required by applicable law or agreed to in writing, software
rem distributed under the License is distributed on an "AS IS" BASIS,
rem WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
rem See the License for the specific language governing permissions and
rem limitations under the License.

rem ---------------------------------------------------------------------------
rem NT Service Install/Uninstall script
rem
rem Usage: service.bat install/remove [service_name [--rename]] [--user username]
rem
rem Options
rem install                 Install the service using default settings.
rem remove                  Remove the service from the system.
rem
rem service_name (optional) The name to use for the service. If not specified,
rem                         Tomcat9 is used as the service name.
rem
rem --rename     (optional) Rename tomcat9.exe and tomcat9w.exe to match
rem                         the non-default service name.
rem
rem username     (optional) The name of the OS user to use to install/remove
rem                         the service (not the name of the OS user the
rem                         service will run as). If not specified, the current
rem                         user is used.
rem ---------------------------------------------------------------------------

setlocal

set "SELFDIR=%~dp0%"
set "SELF=%~dp0%service.bat"

set DEFAULT_SERVICE_NAME=Tomcat9
set SERVICE_NAME=JiraSoftware020424085505

set "CURRENT_DIR=%cd%"

rem Parse the arguments
if "x%1x" == "xx" goto displayUsage
set SERVICE_CMD=%1
shift
if "x%1x" == "xx" goto checkEnv
:checkUser
if "x%1x" == "x/userx" goto runAsUser
if "x%1x" == "x--userx" goto runAsUser
set SERVICE_NAME=%1
shift
if "x%1x" == "xx" goto checkEnv
if "x%1x" == "x--renamex" (
    set RENAME=%1
    shift
)
if "x%1x" == "xx" goto checkEnv
goto checkUser
:runAsUser
shift
if "x%1x" == "xx" goto displayUsage
set SERVICE_USER=%1
shift
runas /env /savecred /user:%SERVICE_USER% "%COMSPEC% /K \"%SELF%\" %SERVICE_CMD% %SERVICE_NAME%"
exit /b 0

rem Check the environment
:checkEnv

set CATALINA_HOME=C:\Users\SWT\Desktop\jira\Jira
                    set JIRA_HOME=C:\Users\SWT\Atlassian\Application Data\Jira
if not "%CATALINA_HOME%" == "" goto gotHome
set "CATALINA_HOME=%cd%"
if exist "%CATALINA_HOME%\bin\%DEFAULT_SERVICE_NAME%.exe" goto gotHome
if exist "%CATALINA_HOME%\bin\%SERVICE_NAME%.exe" goto gotHome
rem CD to the upper dir
cd ..
set "CATALINA_HOME=%cd%"
:gotHome
if exist "%CATALINA_HOME%\bin\%DEFAULT_SERVICE_NAME%.exe" (
    set "EXECUTABLE=%CATALINA_HOME%\bin\%DEFAULT_SERVICE_NAME%.exe"
    goto okHome
)
if exist "%CATALINA_HOME%\bin\%SERVICE_NAME%.exe" (
    set "EXECUTABLE=%CATALINA_HOME%\bin\%SERVICE_NAME%.exe"
    goto okHome
)
if "%DEFAULT_SERVICE_NAME%"== "%SERVICE_NAME%" (
    echo The file %DEFAULT_SERVICE_NAME%.exe was not found...
) else (
    echo Neither the %DEFAULT_SERVICE_NAME%.exe file nor the %SERVICE_NAME%.exe file was found...
)
echo Either the CATALINA_HOME environment variable is not defined correctly or
echo the incorrect service name has been used.
echo Both the CATALINA_HOME environment variable and the correct service name
echo are required to run this program.
exit /b 1
:okHome
cd "%CURRENT_DIR%"

rem Make sure prerequisite environment variables are set
if not "%JRE_HOME%" == "" goto gotJreHome
rem if not "%JAVA_HOME%" == "" goto gotJavaHome
echo Neither the JAVA_HOME nor the JRE_HOME environment variable is defined
echo Service will use the bundled JRE.
echo Failing that, service will try to guess them from the registry.
set "JRE_HOME=%SELFDIR%..\jre"
goto okJava

:gotJavaHome
rem No JRE given, check if JAVA_HOME is usable as JRE_HOME
rem Java 9 has a different directory structure
if exist "%JAVA_HOME%\jre\bin\java.exe" goto preJava9Layout
if not exist "%JAVA_HOME%\bin\java.exe" goto noJavaHomeAsJre
rem Use JAVA_HOME as JRE_HOME
set "JRE_HOME=%JAVA_HOME%"
goto okJava

:preJava9Layout
rem Use JAVA_HOME\jre as JRE_HOME
set "JRE_HOME=%JAVA_HOME%\jre"
goto okJava

:noJavaHomeAsJre
echo The JAVA_HOME environment variable is not defined correctly.
echo JAVA_HOME=%JAVA_HOME%
echo NB: JAVA_HOME should point to a JDK not a JRE.
exit /b 1

:gotJreHome
rem Check if we have a usable JRE
if not exist "%JRE_HOME%\bin\java.exe" goto noJreHome
goto okJava

:noJreHome
rem Needed at least a JRE
echo The JRE_HOME environment variable is not defined correctly
echo JRE_HOME=%JRE_HOME%
echo This environment variable is needed to run this program
exit /b 1

:okJava
if not "%CATALINA_BASE%" == "" goto gotBase
set "CATALINA_BASE=%CATALINA_HOME%"

:gotBase
rem Java 9 no longer supports the java.endorsed.dirs
rem system property. Only try to use it if
rem JAVA_ENDORSED_DIRS was explicitly set
rem or CATALINA_HOME/endorsed exists.
set ENDORSED_PROP=ignore.endorsed.dirs
if "%JAVA_ENDORSED_DIRS%" == "" goto noEndorsedVar
set ENDORSED_PROP=java.endorsed.dirs
goto doneEndorsed
:noEndorsedVar
if not exist "%CATALINA_HOME%\endorsed" goto doneEndorsed
set ENDORSED_PROP=java.endorsed.dirs
:doneEndorsed

rem Process the requested command
if /i %SERVICE_CMD% == install goto doInstall
if /i %SERVICE_CMD% == remove goto doRemove
if /i %SERVICE_CMD% == uninstall goto doRemove
echo Unknown parameter "%SERVICE_CMD%"
:displayUsage
echo.
echo Usage: service.bat install/remove [service_name [--rename]] [--user username]
exit /b 1

:doRemove
rem Remove the service
echo Removing the service '%SERVICE_NAME%' ...
echo Using CATALINA_BASE:    "%CATALINA_BASE%"

"%EXECUTABLE%" //DS//%SERVICE_NAME% ^
    --LogPath "%CATALINA_BASE%\logs"
if not errorlevel 1 goto removed
echo Failed removing '%SERVICE_NAME%' service
exit /b 1
:removed
echo The service '%SERVICE_NAME%' has been removed
if exist "%CATALINA_HOME%\bin\%SERVICE_NAME%.exe" (
    rename "%SERVICE_NAME%.exe" "%DEFAULT_SERVICE_NAME%.exe"
    rename "%SERVICE_NAME%w.exe" "%DEFAULT_SERVICE_NAME%w.exe"
)
exit /b 0

-:doInstall

                    echo.
                    echo Granting full access for Network Service to the Jira home directory '%JIRA_HOME%'
                    icacls "%JIRA_HOME%" /grant "NT AUTHORITY\NetworkService":(OI)(CI)(F)

                    echo.
                    echo Granting read and execute access for Network Service to the Jira installation directory '%CATALINA_HOME%'
                    icacls "%CATALINA_HOME%" /grant "NT AUTHORITY\NetworkService":(OI)(CI)(RX)

                    echo.
                    echo Granting full access for Network Service to the work, temp and logs subdirectories of Jira installation directory '%CATALINA_HOME%'
                    icacls "%CATALINA_HOME%/work" /grant "NT AUTHORITY\NetworkService":(OI)(CI)(F)
                    icacls "%CATALINA_HOME%/temp" /grant "NT AUTHORITY\NetworkService":(OI)(CI)(F)
                    icacls "%CATALINA_HOME%/logs" /grant "NT AUTHORITY\NetworkService":(OI)(CI)(F)

                    setlocal enabledelayedexpansion

                    echo.
                    echo Granting read and execute access for Network Service for parent directories of the Jira home directory '%JIRA_HOME%'.
                    echo They're required to make Java native IO operations work, which are required e.g. when starting up the plugin system.
                    call :setPermissionsForAllParentDirectories "%JIRA_HOME%"

                    echo.
                    echo Granting read and execute access for Network Service for parent directories of the Jira installation directory '%CATALINA_HOME%'.
                    echo They're required to make Java native IO operations work, which are required e.g. when starting up the plugin system.
                    call :setPermissionsForAllParentDirectories "%CATALINA_HOME%"

                    rem Skip the block of code below, as it was already called with parameters earlier. The regular way of using `goto :eof` will not work,
                    rem because that would actually move to the end of the file and the service would not be installed.
                    goto :afterSetPermissionsForAllParentDirectories

                    rem Navigates parents of the passed-in directory one by one and sets read an execute permissions to Network Service
                    :setPermissionsForAllParentDirectories
                    set dirname=%~1\
                    echo Starting to walk up from: "!dirname!"

                    :doLoop
                    for %%A in ("!dirname!") do (
                    set currentPath=%%~dpA
                    set onlyPath=%%~pA
                    if NOT "!onlyPath!"=="\" (
                    echo.
                    echo Checking permissions of !currentPath! [!dirname!]
                    icacls "!currentPath!." | find "NT AUTHORITY\NETWORK SERVICE" | find "" /v /c > last_check

                    for /f "delims=" %%x in (last_check) do set permission_count=%%x

                    if not !permission_count! geq 1 (
                    if not "!currentPath!" == "" (
                    echo Granting read and execute access for Network Service to !currentPath!
                    icacls "!currentPath!." /grant "NT AUTHORITY\NETWORK SERVICE:(RX)"
                    )
                    )
                    set dirname=!dirname!..\
                    goto doLoop
                    )
                    )
                    echo end
                    goto :eof

                    :afterSetPermissionsForAllParentDirectories
                  
rem Install the service
echo Installing the service '%SERVICE_NAME%' ...
echo Using CATALINA_HOME:    "%CATALINA_HOME%"
echo Using CATALINA_BASE:    "%CATALINA_BASE%"
echo Ignoring JAVA_HOME:        "%JAVA_HOME%"
echo Using JRE_HOME:         "%JRE_HOME%"

rem Try to use the server jvm
set "JVM=%JRE_HOME%\bin\server\jvm.dll"
if exist "%JVM%" goto foundJvm
rem Try to use the client jvm
set "JVM=%JRE_HOME%\bin\client\jvm.dll"
if exist "%JVM%" goto foundJvm
echo Warning: Neither 'server' nor 'client' jvm.dll was found at JRE_HOME.
set JVM=auto
:foundJvm
echo Using JVM:              "%JVM%"

set "CLASSPATH=%CATALINA_HOME%\bin\bootstrap.jar;%CATALINA_BASE%\bin\tomcat-juli.jar"
if not "%CATALINA_HOME%" == "%CATALINA_BASE%" set "CLASSPATH=%CLASSPATH%;%CATALINA_HOME%\bin\tomcat-juli.jar"

if "%SERVICE_STARTUP_MODE%" == "" set SERVICE_STARTUP_MODE=auto
if "%JvmMs%" == "" set JvmMs=384
if "%JvmMx%" == "" set JvmMx=2048

if exist "%CATALINA_HOME%\bin\%DEFAULT_SERVICE_NAME%.exe" (
    if "x%RENAME%x" == "x--renamex" (
        rename "%DEFAULT_SERVICE_NAME%.exe" "%SERVICE_NAME%.exe"
        rename "%DEFAULT_SERVICE_NAME%w.exe" "%SERVICE_NAME%w.exe"
        set "EXECUTABLE=%CATALINA_HOME%\bin\%SERVICE_NAME%.exe"
    )
)

call "%CATALINA_HOME%\bin\set-gc-params-service"
if errorlevel 1 exit /b 1

IF "%PROCESSOR_ARCHITECTURE%"=="x86" goto notX64
    set EXECUTABLE=%EXECUTABLE%.x64.exe
:notX64

"%EXECUTABLE%" //IS//%SERVICE_NAME% ^
    --Description "Atlassian Jira 9.15.0" ^
    --DisplayName "Atlassian Jira" ^
    --Install "%EXECUTABLE%" ^
    --LogPath "%CATALINA_BASE%\logs" ^
    --StdOutput auto ^
    --StdError auto ^
    --Classpath "%CLASSPATH%" ^
    --Jvm "%JVM%" ^
    --StartMode jvm ^
    --StopMode jvm ^
    --StartPath "%CATALINA_HOME%" ^
    --StopPath "%CATALINA_HOME%" ^
    --StartClass org.apache.catalina.startup.Bootstrap ^
    --StopClass org.apache.catalina.startup.Bootstrap ^
    --StartParams start ^
    --StopParams stop ^
    --JvmOptions "--add-opens=java.base/java.lang=ALL-UNNAMED;--add-opens=java.base/java.lang.reflect=ALL-UNNAMED;--add-opens=java.base/java.util=ALL-UNNAMED;--add-opens=java.base/java.util.concurrent=ALL-UNNAMED;--add-opens=java.base/java.util.concurrent.atomic=ALL-UNNAMED;--add-opens=java.base/java.io=ALL-UNNAMED;--add-opens=java.base/java.nio.file=ALL-UNNAMED;--add-opens=java.base/javax.crypto=ALL-UNNAMED;--add-opens=java.management/javax.management=ALL-UNNAMED;--add-opens=java.desktop/sun.font=ALL-UNNAMED;--add-opens=java.base/sun.reflect.generics.parser=ALL-UNNAMED;--add-opens=java.base/java.time=ALL-UNNAMED;--add-opens=jdk.management/com.sun.management.internal=ALL-UNNAMED;--add-exports=java.base/sun.util.calendar=ALL-UNNAMED;--add-exports=java.base/sun.security.action=ALL-UNNAMED;--add-exports=java.xml/jdk.xml.internal=ALL-UNNAMED;-Dlog4j2.contextSelector=org.apache.logging.log4j.core.selector.BasicContextSelector;-Dlog4j2.disableJmx=true;-Dlog4j2.garbagefree.threadContextMap=true;-Dlog4j2.isWebapp=false;-Djava.awt.headless=true;-Datlassian.standalone=JIRA;-Dorg.apache.jasper.runtime.BodyContentImpl.LIMIT_BUFFER=true;-Dmail.mime.decodeparameters=true;-Dorg.dom4j.factory=com.atlassian.core.xml.InterningDocumentFactory;-XX:-OmitStackTraceInFastThrow;%GC_JVM_PARAMETERS%;-XX:InitialCodeCacheSize=32m;-XX:ReservedCodeCacheSize=512m;-Dcatalina.home=%CATALINA_HOME%;-Dcatalina.base=%CATALINA_BASE%;-D%ENDORSED_PROP%=%CATALINA_HOME%\endorsed;-Djava.io.tmpdir=%CATALINA_BASE%\temp;-Djava.util.logging.manager=org.apache.juli.ClassLoaderLogManager;-Djava.util.logging.config.file=%CATALINA_BASE%\conf\logging.properties;%JvmArgs%" ^
    --JvmOptions9 "--add-opens=java.base/java.lang=ALL-UNNAMED#--add-opens=java.base/java.io=ALL-UNNAMED#--add-opens=java.base/java.util=ALL-UNNAMED#--add-opens=java.base/java.util.concurrent=ALL-UNNAMED#--add-opens=java.rmi/sun.rmi.transport=ALL-UNNAMED" ^
    --Startup "%SERVICE_STARTUP_MODE%" ^
    --JvmMs "%JvmMs%" ^
    --JvmMx "%JvmMx%" ^
                    --ServiceUser "NT AUTHORITY\NetworkService"
if not errorlevel 1 goto installed
echo Failed installing '%SERVICE_NAME%' service
exit /b 1
:installed
echo The service '%SERVICE_NAME%' has been installed.
exit /b 0
