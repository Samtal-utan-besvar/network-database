CREATE DATABASE user_database;
CREATE DATABASE test_user_database;

CREATE TABLE USERS
(
	user_id SERIAL PRIMARY KEY,
	firstname VARCHAR(32) NOT NULL,
	lastname VARCHAR(32) NOT NULL,
	phone_number VARCHAR(32) NOT NULL,
	email VARCHAR(32) NOT NULL,
	password_hash VARCHAR(256) NOT NULL
);

CREATE TABLE CONTACTS
(
	contact_id SERIAL PRIMARY KEY,
	owner_id integer REFERENCES USERS (user_id),
	contact_user_id integer REFERENCES USERS (user_id)
);