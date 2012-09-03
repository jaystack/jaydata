##
# Script to take mongo backup using mongodump and store it in Backup Server
##
 
#!/bin/bash
 
## Set variables
TodayDate=`date +"%d/%b/%g %r"`
DateStamp=`date +%d%m%y%H%M%S`
CurrentTime=`date +"%r"`
 
MongoBinPath="/usr/bin"
ReplicaSet=`echo 'rs.status()' | $MongoBinPath/mongo | egrep "set" | awk -F \" '{print $4}'`
MongoHost=`hostname`
LocalBackupPath="/databases/dump"
 
LogFile="/var/log/mongo-backup.log"
IsOK=0
CmdStatus=""
 
BackupHost=192.168.1.125
BackupHostPath="/home/backup/mongobackup"
BackupHostPort=22
 
MailNotification="peter.nochta@avangrade.com nochtap@avangrade.com"
 
echo -e "Mongo Backup Status for $ReplicaSet on $TodayDate. \n" > $LogFile
 
## Check whether host is slave and in good state for backup
for i in `echo "rs.status()" | $MongoBinPath/mongo | egrep "name" | awk -F \" '{print $4}'| cut -f 1 -d :`; do
 IsMaster=`echo "db.isMaster()"| $MongoBinPath/mongo --host $i | grep ismaster|awk -F ":" '{print $2}' | cut -f 1 -d ,`;
 TheState=`echo "rs.status()"| $MongoBinPath/mongo --host $i | grep -i mystate | awk -F ":" '{print $2}' | cut -f 1 -d ,`;
 if ( $IsMaster == "false" -a $TheState -eq 2  ); then
  MongoHost=$i
  IsOK=1
  echo "$CurrentTime: $MongoHost is slave and looks OK." >> $LogFile
  break
 fi
done
 
CurrentTime=`date +"%r"`
 
## Exit if not good
if ( $IsOK -eq 0 ); then
   echo "$CurrentTime: Error: Either $MongoHost is not slave or not in good state. Aborting Backup, Please check!" >> $LogFile
   mail -s "Backup error for $ReplicaSet from $MongoHost on $TodayDate" $MailNotification < $LogFile
   exit 1; 
fi 
## Remove earlier backup CmdStatus=$(rm -rf $LocalBackupPath/*) 
## Start backup process 
echo "$CurrentTime: Starting Dump, executing $MongoBinPath/mongodump --out $LocalBackupPath --host $MongoHost..." >> $LogFile
 
CmdStatus=`$MongoBinPath/mongodump --out $LocalBackupPath --host $MongoHost --oplog`
if ( $? -ne 0 ); then
  echo "$CurrentTime: There is an issue while trying to take dump in $MongoHost. Aborting dump process, please check! " >> $LogFile
  cat $CmdStatus >> $LogFile
  mail -s "Backup error for $ReplicaSet from $MongoHost on $TodayDate" $MailNotification < $LogFile
  exit 
fi 
CurrentTime=`date +"%r"` 
BackupSize=$(du -sh $LocalBackupPath/. | awk '{ print $1 }') 
echo "$CurrentTime: Mongodump command completed. Backup size is $BackupSize. " >> $LogFile
 
exit
## dump is fine then scp it to backup server
## create directory first
CmdStatus=$(ssh -p $BackupHostPort $BackupHost "mkdir -p  $BackupHostPath/$ReplicaSet/$DateStamp")
 
if ( $? -ne 0 ); then
  echo "$CurrentTime: Either failing to connect Backup server using ssh or destination directory already exist!" >> $LogFile
  cat $CmdStatus >> $LogFile
  mail -s "Backup error for $ReplicaSet from $MongoHost on $TodayDate" $MailNotification < $LogFile
  exit 
fi 
CurrentTime=`date +"%r"`
echo "$CurrentTime: Directory created on backup server, copying data using scp..." >> $LogFile
 
CmdStatus=`scp -P $BackupHostPort -r $LocalBackupPath/* $BackupHost:/$BackupHostPath/$ReplicaSet/$DateStamp/`
if ( $? -ne 0 ); then
  echo "$CurrentTime: Unable to scp dump to $BackupHost:/$BackupHostPath/$ReplicaSet/$DateStamp using port $BackupHostPort. " >> $LogFile
  cat $CmdStatus >> $LogFile
  mail -s "Backup error for $ReplicaSet from $MongoHost on $TodayDate" $MailNotification < $LogFile
  exit 
fi 
CurrentTime=`date +"%r"`
echo "$CurrentTime: Copied dump to backup server in directory $BackupHost$BackupHostPath/$ReplicaSet/$DateStamp/." >> $LogFile
echo "$CurrentTime: Mongo Backup process completed successfully." >> $LogFile
mail -s "Backup for $ReplicaSet done on $MongoHost at $TodayDate" $MailRecipients $MailNotification < $LogFile

