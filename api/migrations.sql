-- migrations.sql
-- Run these queries to set up authentication tables

SET sql_mode = '';

-- Student credentials table
CREATE TABLE IF NOT EXISTS `student_credentials` (
  `StudentNumber` varchar(45) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `PhoneNumber` varchar(20) DEFAULT NULL,
  `IsVerified` tinyint(1) NOT NULL DEFAULT 0,
  `VerificationToken` varchar(100) DEFAULT NULL,
  `ResetToken` varchar(100) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL,
  `VerifiedAt` datetime DEFAULT NULL,
  `LastLogin` datetime DEFAULT NULL,
  PRIMARY KEY (`StudentNumber`),
  UNIQUE KEY `Email` (`Email`),
  KEY `VerificationToken` (`VerificationToken`),
  KEY `ResetToken` (`ResetToken`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `StudentNumber` varchar(45) NOT NULL,
  `Token` varchar(255) NOT NULL,
  `ExpiresAt` datetime NOT NULL,
  `CreatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Token` (`Token`),
  KEY `StudentNumber` (`StudentNumber`),
  KEY `ExpiresAt` (`ExpiresAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Login attempts tracking (optional - for enhanced security)
CREATE TABLE IF NOT EXISTS `login_attempts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Email` varchar(100) NOT NULL,
  `IpAddress` varchar(45) NOT NULL,
  `AttemptedAt` datetime NOT NULL,
  `Success` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `Email` (`Email`),
  KEY `IpAddress` (`IpAddress`),
  KEY `AttemptedAt` (`AttemptedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Clean up expired tokens (run as cron job)
-- DELETE FROM refresh_tokens WHERE ExpiresAt < NOW();
-- DELETE FROM login_attempts WHERE AttemptedAt < DATE_SUB(NOW(), INTERVAL 30 DAY);

CREATE TABLE IF NOT EXISTS `grades` (
  `GradeID` int NOT NULL,
  `ClassNo` varchar(15) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL DEFAULT '',
  `FacultyID` varchar(15) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL DEFAULT '',
  `FacultyName` varchar(100) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `StudentNumber` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `FirstName` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `MiddleName` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `LastName` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `Birthday` varchar(25) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `BirthPlace` varchar(100) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `Gender` varchar(25) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `SubjectCode` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL DEFAULT '',
  `Description` varchar(65) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL DEFAULT '',
  `LecUnit` float NOT NULL DEFAULT '0',
  `LabUnit` varchar(15) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL DEFAULT '0',
  `Instructor` varchar(150) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL DEFAULT '',
  `Section` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL DEFAULT '',
  `PGrade` double NOT NULL DEFAULT '0',
  `PreMid` double NOT NULL,
  `MGrade` double NOT NULL DEFAULT '0',
  `PreFinal` double NOT NULL,
  `FGrade` double NOT NULL DEFAULT '0',
  `Average` double NOT NULL,
  `Sem` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL DEFAULT '',
  `SY` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL DEFAULT '',
  `Status` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL DEFAULT '',
  `Equivalent` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL DEFAULT '',
  `CreditUnits` double NOT NULL,
  `SchoolName` varchar(150) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL DEFAULT '',
  `Course` varchar(100) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `GradeStatus` varchar(15) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `YearLevel` varchar(25) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `Remarks` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `GradRefNo` varchar(25) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `GradDate` varchar(25) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  PRIMARY KEY  USING BTREE (`GradeID`,`ClassNo`,`FacultyID`,`StudentNumber`,`SY`,`Sem`),
  KEY `SY` (`SY`),
  KEY `Sem` (`Sem`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

CREATE TABLE IF NOT EXISTS `studeaccount` (
  `AccountID` int(10) unsigned NOT NULL auto_increment,
  `StudentNumber` varchar(45) NOT NULL default '',
  `FirstName` varchar(45) NOT NULL default '',
  `MiddleName` varchar(45) NOT NULL default '',
  `LastName` varchar(45) NOT NULL default '',
  `Course` varchar(150) NOT NULL default '',
  `YearLevel` varchar(45) NOT NULL default '',
  `Status` varchar(45) NOT NULL default '',
  `LecUnits` double NOT NULL default '0',
  `LecRate` double NOT NULL default '0',
  `TotalLec` double NOT NULL default '0',
  `LabUnits` double NOT NULL default '0',
  `LabRate` double NOT NULL default '0',
  `TotalLab` double NOT NULL default '0',
  `OldAccount` double NOT NULL default '0',
  `FeesDesc` text NOT NULL,
  `FeesAmount` double NOT NULL default '0',
  `TotalFees` double NOT NULL default '0',
  `DiscPercentage` double NOT NULL default '0',
  `Discount` double NOT NULL default '0',
  `AcctTotal` double NOT NULL default '0',
  `TotalPayments` double NOT NULL default '0',
  `CurrentBalance` double NOT NULL default '0',
  `Sem` varchar(45) NOT NULL default '',
  `SY` varchar(45) NOT NULL default '',
  `Term` varchar(45) NOT NULL default '',
  `Desc1` varchar(100) NOT NULL default '',
  `Amount1` double NOT NULL default '0',
  `Desc2` varchar(100) NOT NULL default '',
  `Amount2` double NOT NULL default '0',
  `Desc3` varchar(100) NOT NULL default '',
  `Amount3` double NOT NULL default '0',
  `Desc4` varchar(100) NOT NULL default '',
  `Amount4` double NOT NULL default '0',
  `Desc5` varchar(100) NOT NULL default '',
  `Amount5` double NOT NULL default '0',
  `RegFee` double NOT NULL default '0',
  `Section` varchar(45) NOT NULL default '',
  `PaymentMode` varchar(45) NOT NULL default '0000-00-00',
  `InstallmentFee` double NOT NULL default '0',
  `DateUpdated` date NOT NULL default '0000-00-00',
  `Refund` double NOT NULL default '0',
  `DiscDesc1` varchar(45) NOT NULL default '',
  `DiscAmount1` double NOT NULL default '0',
  `DiscDesc2` varchar(45) NOT NULL default '',
  `DiscAmount2` double NOT NULL default '0',
  `DiscDesc3` varchar(45) NOT NULL default '',
  `DiscAmount3` double NOT NULL default '0',
  `DiscDesc4` varchar(45) NOT NULL default '',
  `DiscAmount4` double NOT NULL default '0',
  `DiscDesc5` varchar(45) NOT NULL default '',
  `DiscAmount5` double NOT NULL default '0',
  `TotalComputerUnits` double NOT NULL,
  `TotalCulinaryUnits` double NOT NULL,
  `TotalCulinaryCharges` double NOT NULL,
  `TotalComputerCharges` double NOT NULL,
  `CulinaryRates` double NOT NULL,
  `ComputerRates` double NOT NULL,
  `Transcode` varchar(10) NOT NULL,
  `Others` double NOT NULL,
  `Email` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL DEFAULT '',
  PRIMARY KEY  (`AccountID`,`StudentNumber`),
  KEY `FK_studeaccount_1` (`StudentNumber`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;