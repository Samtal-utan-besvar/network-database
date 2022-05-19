# Follow the instructions to setup the database

# Create the database
CREATE DATABASE user_database;

# Connect to database with "\c user_database"

# Copy paste and click enter
CREATE TABLE USERS
(
	user_id SERIAL PRIMARY KEY,
	firstname VARCHAR(32) NOT NULL,
	lastname VARCHAR(32) NOT NULL,
	phone_number VARCHAR(32) NOT NULL,
	email VARCHAR(32) NOT NULL,
	password_hash VARCHAR(256) NOT NULL
);

# Copy paste and click enter
CREATE TABLE CONTACTS
(
	contact_id SERIAL PRIMARY KEY,
	owner_id integer REFERENCES USERS (user_id),
	contact_user_id integer REFERENCES USERS (user_id)
);