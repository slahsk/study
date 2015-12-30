<?php 

$log = date("Y/m/d H:i:s")."\t";
$log .= $_SERVER["HTTP_USER_AGENT"]."\t";
$log .= $_SERVER["HTTP_REFERER"]."\t";
$log .= gethostbyaddr($_SERVER["REMOTE_ADDR"])."\n";
$fh = fopen("log.txt", "a");
flock($fh, LOCK_EX);
fputs($fh, $log);
flock($fh, LOCK_UN);
fclose($fh);

?>