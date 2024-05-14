#!/bin/sh

j_ver=`echo "$($JAVA_HOME/bin/java -version 2>&1)" | grep "version" | awk '{ print substr($3, 2, length($3)-2); }'`
IFS='.' read -a j_ver_parts <<< "$j_ver"

if [[ ${j_ver_parts[0]} = 17 ]]; then
  JVM_OPENS=$(cat $PRGDIR/java-opens.txt)
  JAVA_OPTS="$JVM_OPENS $JAVA_OPTS"
fi
