<?php

header('Content-type: text/plain');
$toMail, $toName, $subject, $message

require_once '../libs/phpmailer/class.phpmailer.php';

$mail = new PHPMailer();

// For testing purposes...
$mail->SMTPDebug = true;
$mail->SMTPDebugFile = $cf['email']['log'];

$mail->IsSMTP();
$mail->Host = $cf['email']['smtp'];
$mail->SMTPAuth = true;
$mail->Username = $cf['email']['address'];
$mail->Password = $cf['email']['password'];

$sender = $cf['title'] . ' - renshuu.paazmaya.com';
//$sender = htmlentities($sender, ENT_QUOTES, 'UTF-8');
mb_internal_encoding('UTF-7');
$sender = mb_encode_mimeheader($sender, 'UTF-7', 'Q'); // from PHP manual

$mail->SetFrom($cf['email']['address'], $sender);

// Minor changes every 5 months
// Patch changes every 2 weeks
// Sub patch first number, changes every ~4 hours
// If sub patch is 3 numbers long, its last changes every ~2 minutes
// If sub patch is 4 numbers long, its last changes every ~10 seconds
$now = strval(time());
$ver = '0.' . substr($now, 2, 1) . '.' . substr($now, 3, 1) . '.' . substr($now, 4, 3);
$mail->Version = $ver;

$mail->AddAddress($toMail, $toName);
$mail->AddBCC($cf['email']['address'], $mail->FromName);

$mail->WordWrap = 50;
//$mail->AddAttachment("/var/tmp/file.tar.gz");
$mail->IsHTML(false);

$signature = "\n\n-------------------\nRENSHUU.PAAZMAYA.COM\nhttp://renshuu.paazmaya.com/\nv" . $ver;

mb_internal_encoding('UTF-8');
$signature .= "\nUTF-8:" . mb_encode_mimeheader($cf['title'], 'UTF-8', 'Q'); 
mb_internal_encoding('UTF-7');
$signature .= "\nUTF-7:" . mb_encode_mimeheader($cf['title'], 'UTF-7', 'Q'); 
mb_internal_encoding('ISO-8859-15');
$signature .= "\nISO-8859-15:" . mb_encode_mimeheader($cf['title'], 'ISO-8859-15', 'Q'); 
mb_internal_encoding('ISO-8859-1');
$signature .= "\nISO-8859-1:" . mb_encode_mimeheader($cf['title'], 'ISO-8859-1', 'Q'); 


$mail->Subject = $subject;
$mail->Body = $message . $signature;

$mail->Send();
echo "\n" . $mail->ErrorInfo;
