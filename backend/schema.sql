DROP DATABASE IF EXISTS job_linked;

CREATE DATABASE IF NOT EXISTS job_linked;

USE job_linked;

CREATE TABLE users (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `about` VARCHAR(255),
    `location` VARCHAR(255),
    `user_type` VARCHAR(255) NOT NULL
);

CREATE TABLE job_postings(
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `author_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `qualification` VARCHAR(5000) NOT NULL,
    `key_description` VARCHAR(600) NOT NULL,
    `description` VARCHAR(5000) NOT NULL,
    `deadline` VARCHAR(255) NOT NULL
);

CREATE TABLE jobApp (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `userId` INT NOT NULL,
    `jobId` INT NOT NULL
);
     
CREATE TABLE education (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `school` VARCHAR(255) NOT NULL,
    `degree` VARCHAR(255) NOT NULL,
    `gpa` VARCHAR(255),
    `awards` VARCHAR(255),
    `userid` INT NOT NULL
);

CREATE TABLE jobExperience (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `country` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `company` VARCHAR(255) NOT NULL,
    `userid` INT NOT NULL
);

CREATE TABLE interview (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `employee` INT NOT NULL,
    `employer` INT NOT NULL,
    `jobPostingId` INT NOT NULL,
    `date_time` VARCHAR(255) NOT NULL
);

CREATE TABLE review (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `reviewer` INT NOT NULL,
    `company` INT NOT NULL,
    `rating` INT NOT NULL,
    `description` VARCHAR(255) NOT NULL
);

