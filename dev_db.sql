-- ==============================
-- Database: dev_db
-- ==============================
CREATE DATABASE IF NOT EXISTS dev_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dev_db;

-- ==============================
-- ENUMs
-- ==============================
-- Role
CREATE TYPE Role AS ENUM ('ADMIN', 'USER');

-- DurationType
CREATE TYPE DurationType AS ENUM ('PERMANENT', 'TEMPORARY');

-- RequestStatus
CREATE TYPE RequestStatus AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DomainStatus
CREATE TYPE DomainStatus AS ENUM ('ACTIVE', 'EXPIRED', 'TRASHED');

-- Purpose
CREATE TYPE Purpose AS ENUM ('InNSTRU', 'InOutNSTRU', 'NoSever', 'Sever', 'None');

-- signupusers_role
CREATE TYPE signupusers_role AS ENUM ('ADMIN', 'USER');

-- signupusers_status
CREATE TYPE signupusers_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- ==============================
-- Table: positions
-- ==============================
CREATE TABLE positions (
    id VARCHAR(25) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ==============================
-- Table: signupusers
-- ==============================
CREATE TABLE signupusers (
    id VARCHAR(25) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    contactP VARCHAR(50),
    contactE VARCHAR(255),
    role ENUM('ADMIN','USER') DEFAULT 'USER',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING'
) ENGINE=InnoDB;

-- ==============================
-- Table: users
-- ==============================
CREATE TABLE users (
    id VARCHAR(25) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN','USER') DEFAULT 'USER',
    positionId VARCHAR(25),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    signUpUserId VARCHAR(25) UNIQUE,
    CONSTRAINT fk_users_position FOREIGN KEY (positionId) REFERENCES positions(id),
    CONSTRAINT fk_users_signupuser FOREIGN KEY (signUpUserId) REFERENCES signupusers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==============================
-- Table: domain_requests
-- ==============================
CREATE TABLE domain_requests (
    id VARCHAR(25) PRIMARY KEY,
    domain VARCHAR(255) NOT NULL,
    ipAddress VARCHAR(50),
    machineType VARCHAR(50) DEFAULT 'PC/Mac',
    OS VARCHAR(50) DEFAULT 'MS Windows',
    otherMachineType VARCHAR(50) DEFAULT 'NO',
    otherOS VARCHAR(50) DEFAULT 'No',
    requesterName VARCHAR(255),
    responsibleName VARCHAR(255),
    position VARCHAR(255),
    department VARCHAR(255),
    institution VARCHAR(255),
    contactP VARCHAR(50),
    contactE VARCHAR(255),
    responsibleContactP VARCHAR(50),
    responsibleContactE VARCHAR(255),
    machineAdminType VARCHAR(50) DEFAULT 'requester',
    machineAdminName VARCHAR(255),
    machineAdminPosition VARCHAR(255),
    machineAdminContactP VARCHAR(50),
    machineAdminContactE VARCHAR(255),
    machineRoom VARCHAR(255),
    machinePlace VARCHAR(255),
    property ENUM('InNSTRU','InOutNSTRU','NoSever','Sever','None') DEFAULT 'InNSTRU',
    useType ENUM('InNSTRU','InOutNSTRU','NoSever','Sever','None') DEFAULT 'NoSever',
    purpose VARCHAR(255) DEFAULT 'NO',
    requestedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    durationType ENUM('PERMANENT','TEMPORARY'),
    expiresAt DATETIME,
    status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
    approvalCooldownAt DATETIME,
    userId VARCHAR(25) NOT NULL,
    CONSTRAINT fk_domain_requests_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_userId(userId)
) ENGINE=InnoDB;

-- ==============================
-- Table: domains
-- ==============================
CREATE TABLE domains (
    id VARCHAR(25) PRIMARY KEY,
    domainRequestId VARCHAR(25) UNIQUE,
    lastUsedAt DATETIME,
    deletedAt DATETIME,
    trashExpiresAt DATETIME,
    status ENUM('ACTIVE','EXPIRED','TRASHED') DEFAULT 'ACTIVE',
    decideTime DATETIME,
    CONSTRAINT fk_domains_domain_request FOREIGN KEY (domainRequestId) REFERENCES domain_requests(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==============================
-- Table: deleted_domain_logs
-- ==============================
CREATE TABLE deleted_domain_logs (
    id VARCHAR(25) PRIMARY KEY,
    domainName VARCHAR(255),
    deletedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    reason TEXT
) ENGINE=InnoDB;
