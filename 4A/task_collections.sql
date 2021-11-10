-- create databse
CREATE DATABASE db_task_collection;
-- use the database
use db_task_collection;

-- create table 
CREATE TABLE user_tb (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email varchar(50) NOT NULL UNIQUE,
    username varchar(50) NOT NULL UNIQUE,
    password varchar(50) NOT NULL
);

CREATE TABLE collections_tb (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name varchar(50) NOT NULL,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES user_tb(id)
);

CREATE TABLE task_tb (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name varchar(50) NOT NULL,
    is_done boolean DEFAULT false,
    collections_id INT,
    FOREIGN KEY (collections_id) REFERENCES collections_tb(id)
);
-- end create table

-- input some data
-- input user
INSERT INTO user_tb (email,username,password) VALUES 
('user1@mail.com', 'user1', 'user1'),
('user2@mail.com', 'user2', 'user2');

INSERT INTO collections_tb(name,user_id) VALUES
('School',1),
('Work', 1),
('Shopping', 1),
('Personal', 1),
('Work', 2),
('Personal', 2);

INSERT INTO task_tb(name,collections_id) VALUES
('Doing Homework',1),
('Input data',2),
('Review Content',2),
('Research Content',2),
('Claim voucher 11.11',3),
('Buy Food',3),
('Pray',4),
('Bath',4);

INSERT INTO task_tb(name,collections_id) VALUES
('Input Data', 5),
('Edit Video', 5),
('Upload Video', 5),
('Pray', 6),
('Lunch', 6);




