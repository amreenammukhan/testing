#
# If the limit of files that Jira can open is too low, it will be set to this value.
#
MIN_NOFILES_LIMIT=4096

#
# One way to set the JIRA HOME path is here via this variable.  Simply uncomment it and set a valid path like /jira/home.  You can of course set it outside in the command terminal.  That will also work.
#
#JIRA_HOME=""

#
#  Occasionally Atlassian Support may recommend that you set some specific JVM arguments.  You can use this variable below to do that.
#
JVM_SUPPORT_RECOMMENDED_ARGS=""

#
# The following 2 settings control the minimum and maximum given to the JIRA Java virtual machine.  In larger JIRA instances, the maximum amount will need to be increased.
#
JVM_MINIMUM_MEMORY="384m"
JVM_MAXIMUM_MEMORY="768m"

#
# The following setting configures the size of JVM code cache.  A high value of reserved size allows Jira to work with more installed apps.
#
JVM_CODE_CACHE_ARGS='-XX:InitialCodeCacheSize=32m -XX:ReservedCodeCacheSize=512m'

#
# The following are the required arguments for JIRA.
#
JVM_REQUIRED_ARGS='-Dlog4j2.contextSelector=org.apache.logging.log4j.core.selector.BasicContextSelector -Dlog4j2.disableJmx=true -Dlog4j2.garbagefree.threadContextMap=true -Dlog4j2.isWebapp=false -Djava.awt.headless=true -Datlassian.standalone=JIRA -Dorg.apache.jasper.runtime.BodyContentImpl.LIMIT_BUFFER=true -Dmail.mime.decodeparameters=true -Dorg.dom4j.factory=com.atlassian.core.xml.InterningDocumentFactory'

# Uncomment this setting if you want to import data without notifications
#
#DISABLE_NOTIFICATIONS=" -Datlassian.mail.senddisabled=true -Datlassian.mail.fetchdisabled=true -Datlassian.mail.popdisabled=true"


#-----------------------------------------------------------------------------------
#
# In general don't make changes below here
#
#-----------------------------------------------------------------------------------

#-----------------------------------------------------------------------------------
# Prevents the JVM from suppressing stack traces if a given type of exception
# occurs frequently, which could make it harder for support to diagnose a problem.
#-----------------------------------------------------------------------------------
JVM_EXTRA_ARGS="-XX:-OmitStackTraceInFastThrow -Djava.locale.providers=COMPAT "

CURRENT_NOFILES_LIMIT=$( ulimit -Hn )
ulimit -Sn $CURRENT_NOFILES_LIMIT
ulimit -n $(( CURRENT_NOFILES_LIMIT > MIN_NOFILES_LIMIT  ? CURRENT_NOFILES_LIMIT : MIN_NOFILES_LIMIT ))

PRGDIR=`dirname "$0"`
cat "${PRGDIR}"/jirabanner.txt

JIRA_HOME_MINUSD=""
if [ "$JIRA_HOME" != "" ]; then
    echo $JIRA_HOME | grep -q " "
    if [ $? -eq 0 ]; then
	    echo ""
	    echo "--------------------------------------------------------------------------------------------------------------------"
		echo "   WARNING : You cannot have a JIRA_HOME environment variable set with spaces in it.  This variable is being ignored"
	    echo "--------------------------------------------------------------------------------------------------------------------"
    else
		JIRA_HOME_MINUSD=-Djira.home=$JIRA_HOME
    fi
fi

# DO NOT remove the following line
# !INSTALLER SET JAVA_HOME

JAVA_OPTS="-Xms${JVM_MINIMUM_MEMORY} -Xmx${JVM_MAXIMUM_MEMORY} ${JVM_CODE_CACHE_ARGS} ${JAVA_OPTS} ${JVM_REQUIRED_ARGS} ${DISABLE_NOTIFICATIONS} ${JVM_SUPPORT_RECOMMENDED_ARGS} ${JVM_EXTRA_ARGS} ${JIRA_HOME_MINUSD} ${START_JIRA_JAVA_OPTS}"

j_ver=`echo "$($JAVA_HOME/bin/java -version 2>&1)" | grep "version" | awk '{ print substr($3, 2, length($3)-2); }'`
IFS='.' read -a j_ver_parts <<< "$j_ver"

if [[ ${j_ver_parts[0]} = 17 ]]; then
  JVM_OPENS=$(cat $PRGDIR/java-opens.txt)
  JAVA_OPTS="$JVM_OPENS $JAVA_OPTS"
fi

export JAVA_OPTS

echo ""
echo "If you encounter issues starting or stopping JIRA, please see the Troubleshooting guide at https://docs.atlassian.com/jira/jadm-docs-0915/Troubleshooting+installation"
echo ""
if [ "$JIRA_HOME_MINUSD" != "" ]; then
    echo "Using JIRA_HOME:       $JIRA_HOME"
fi

# set the location of the pid file
if [ -z "$CATALINA_PID" ] ; then
    if [ -n "$CATALINA_BASE" ] ; then
        CATALINA_PID="$CATALINA_BASE"/work/catalina.pid
    elif [ -n "$CATALINA_HOME" ] ; then
        CATALINA_PID="$CATALINA_HOME"/work/catalina.pid
    fi
fi
export CATALINA_PID

if [ -z "$CATALINA_BASE" ]; then
  if [ -z "$CATALINA_HOME" ]; then
    LOGBASE=$PRGDIR
    LOGTAIL=..
  else
    LOGBASE=$CATALINA_HOME
    LOGTAIL=.
  fi
else
  LOGBASE=$CATALINA_BASE
  LOGTAIL=.
fi

PUSHED_DIR=`pwd`
cd $LOGBASE
cd $LOGTAIL
LOGBASEABS=`pwd`
cd $PUSHED_DIR

echo ""
echo "Server startup logs are located in $LOGBASEABS/logs/catalina.out"
