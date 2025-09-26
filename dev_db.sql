-- Database
CREATE DATABASE IF NOT EXISTS dev_db;
USE dev_db;

-- Enum tables (MySQL ไม่มี enum แบบ Prisma, ใช้ ENUM type)
-- แต่เราจะใช้ ENUM ใน column เลย

-- Table: positions
CREATE TABLE positions (
    id VARCHAR(25) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: signUpUsers
CREATE TABLE signUpUsers (
    id VARCHAR(25) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    contactP VARCHAR(255) NOT NULL,
    contactE VARCHAR(255) NOT NULL,
    role ENUM('ADMIN','USER') DEFAULT 'USER',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING'
);

-- Table: users
CREATE TABLE users (
    id VARCHAR(25) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN','USER') DEFAULT 'USER',
    positionId VARCHAR(25),
    signUpUserId VARCHAR(25) UNIQUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (positionId) REFERENCES positions(id),
    FOREIGN KEY (signUpUserId) REFERENCES signUpUsers(id) ON DELETE CASCADE
);

-- Table: domain_requests
CREATE TABLE domain_requests (
    id VARCHAR(25) PRIMARY KEY,
    domain VARCHAR(255) NOT NULL,
    ipAddress VARCHAR(255),
    machineType VARCHAR(255) DEFAULT 'PC/Mac',
    OS VARCHAR(255) DEFAULT 'MS Windows',
    otherMachineType VARCHAR(255) DEFAULT 'NO',
    otherOS VARCHAR(255) DEFAULT 'No',
    requesterName VARCHAR(255) NOT NULL,
    responsibleName VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    contactP VARCHAR(255) NOT NULL,
    contactE VARCHAR(255) NOT NULL,
    responsibleContactP VARCHAR(255),
    responsibleContactE VARCHAR(255),
    machineAdminType VARCHAR(255) DEFAULT 'requester',
    machineAdminName VARCHAR(255) NOT NULL,
    machineAdminPosition VARCHAR(255) NOT NULL,
    machineAdminContactP VARCHAR(255) NOT NULL,
    machineAdminContactE VARCHAR(255) NOT NULL,
    machineRoom VARCHAR(255),
    machinePlace VARCHAR(255),
    property ENUM('InNSTRU','InOutNSTRU','NoSever','Sever','None') DEFAULT 'InNSTRU',
    useType ENUM('InNSTRU','InOutNSTRU','NoSever','Sever','None') DEFAULT 'NoSever',
    purpose VARCHAR(255) DEFAULT 'NO',
    requestedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    durationType ENUM('PERMANENT','TEMPORARY') NOT NULL,
    expiresAt DATETIME,
    status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
    approvalCooldownAt DATETIME,
    userId VARCHAR(25) NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: domains
CREATE TABLE domains (
    id VARCHAR(25) PRIMARY KEY,
    domainRequestId VARCHAR(25) UNIQUE NOT NULL,
    lastUsedAt DATETIME,
    deletedAt DATETIME,
    trashExpiresAt DATETIME,
    status ENUM('ACTIVE','EXPIRED','TRASHED') DEFAULT 'ACTIVE',
    decideTime DATETIME,
    FOREIGN KEY (domainRequestId) REFERENCES domain_requests(id) ON DELETE CASCADE
);

-- Table: deleted_domain_logs
CREATE TABLE deleted_domain_logs (
    id VARCHAR(25) PRIMARY KEY,
    domainName VARCHAR(255) NOT NULL,
    deletedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    reason TEXT
);
