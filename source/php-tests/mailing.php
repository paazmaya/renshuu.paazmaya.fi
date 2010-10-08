<?php

header('Content-type: text/plain');
$toMail = 'olavic@gmail.com';
$toName = 'Juga Paazmaya';
$subject = 'Kukkuu Apina!';
$message = 'Testing the abilities of the multibyte string handling in emails.　パーソネン　ユッカ　・　雪花';

require_once './config.php';
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
$sender = mb_encode_mimeheader($sender, 'UTF-8', 'Q');

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
$mail->AddAttachment('./img/favicon64x64.png');
$mail->IsHTML(false);


$signature = "\n\n-------------------\nRENSHUU.PAAZMAYA.COM\nhttp://renshuu.paazmaya.com/\nv" . $ver;


mb_internal_encoding('UTF-8');
$mail->AddCustomHeader('X-Tonttu-UTF8: ' . mb_encode_mimeheader($cf['title'], 'UTF-8', 'Q'));
mb_internal_encoding('UTF-7');
$mail->AddCustomHeader('X-Tonttu-UTF7: ' . mb_encode_mimeheader($cf['title'], 'UTF-7', 'Q'));
mb_internal_encoding('ISO-8859-15');
$mail->AddCustomHeader('X-Tonttu-ISO-8859-15: ' . mb_encode_mimeheader($cf['title'], 'ISO-8859-15', 'Q'));
mb_internal_encoding('ISO-8859-1');
$mail->AddCustomHeader('X-Tonttu-ISO-8859-1: ' . mb_encode_mimeheader($cf['title'], 'ISO-8859-1', 'Q'));

//$mail->AddCustomHeader('Content-Type: text/plain; charset="iso-8859-1"');
$mail->AddCustomHeader('Content-Language: en_GB');


mb_internal_encoding('UTF-8');

$mail->Subject = $subject;
$mail->Body = $message . $signature;

$mail->Send();
echo "\n" . $mail->ErrorInfo;
