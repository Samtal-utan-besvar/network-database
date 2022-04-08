# Database & Signal Server

This repository contains a PostgeSQL based REST application and a WS based signal server. It's designed to  to store users with a phonenumber and handle call requests by exchanging SDP data and ICE candidates. Take note that database security is not guaranteed, as the local managment and setup is just as important as it's management in code.

## Setup & Installation
NodeJS, NPM and PostgreSQL are the required dependecies you need to run this project. OpenSSL is also recommended for generating the SHA-256 key later on during setup.

### Installation on Linux (apt, wget)
NodeJS: ```sudo apt install nodejs```\
NPM: ```sudo apt install npm```\
PostgreSQL:\
```sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'```\
```wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -```\
```sudo apt-get update```\
```sudo apt-get -y install postgresql```\
OpenSSL: https://github.com/openssl/openssl/blob/master/INSTALL.md#installing-openssl (Optional) 

### Installation on Windows
NodeJS & NPM: https://nodejs.org/en/download/ \
PostgreSQL: https://www.postgresql.org/download/windows/ \
OpenSSL: https://slproweb.com/products/Win32OpenSSL.html (Optional)

### Setup
Once the required dependencies are installed you need to generate a SHA-256 key in the ./keys folder with the name of ""tokenSecret.key"". This can be done using OpenSSL with the command ```openssl genrsa -out tokenSecret.key 4096``` while in the keys folder.

To generate the required database use the database.sql file containgin the two schemas used for the user and contact table. This can be done while connected to the database with the correct user privileges.

When you have a key and the database is setup simply type ```npm start``` to start the servers or ```npm test``` to run the tests. The launch variables and dependencies can be changed in ""package.json"".

## Server Communication
To use the database and signal server, HTTP and websocket clients are required. It's highly recommended to use ""Postman"" to manually test the HTTP and websocket requests. Both servers use JSON as the dataformat to be sent and received.

### Databaseserver Communication
#### Create a User: ""http://your_adress:8080/create_user""
```
{
    "firstname": "First",
    "lastname": "Last",
    "phone_number": "1234567890",
    "email": "somenice@domain.yup",
    "password": "SuperSecure"
}
```
***
#### Login a User: ""http://your_adress:8080/login""
```
{
    "email": "somenice@domain.yup",
    "password": "SuperSecure"
}
```
* Returns JWT token for future verification
***
#### Authenticate a User: ""http://your_adress:8080/authenticate""
Header (authorization): *(User's JWT token)*
```
{}
```
* Returns JWT token for future verification
***
#### Add a Contact: ""http://your_adress:8080/add_contact""
Header (authorization): *(User's JWT token)*
```
{
    "contact_phonenumber": "1212121212"
}
```
***
#### Get Contacts: ""http://your_adress:8080/get_contacts""
Header (authorization): *(User's JWT token)*
```
{}
```
***
#### Delete Contact: ""http://your_adress:8080/delete_contact""
Header (authorization): *(User's JWT token)*
```
{
    "owner_phonenumber": "1234567890",
    "contact_phonenumber": "1212121212"
}
```

&nbsp;

### Signalserver Communication
#### Connect: ""ws://your_adress:4000""
```
{
    "REASON": "connect",
    "TOKEN": "usersJWTTokenShouldBeHere"
}
```
***
#### Call: ""ws://your_adress:4000""
```
{
    "REASON": "call",
    "CALLER_PHONE_NUMBER": "1234567890",
    "TARGET_PHONE_NUMBER": "1212121212",
    "SDP": "*SDP Request*"
}
```
***
#### Call Response: ""ws://your_adress:4000""
```
{
    "REASON": "callResponse",
    "RESPONSE": "accept",                   // or "deny"
    "CALLER_PHONE_NUMBER": "1212121212",
    "TARGET_PHONE_NUMBER": "1234567890",
    "SDP": "*SDP Request*"
}
```
***
#### Send ICE Candidate: ""ws://your_adress:4000""
```
{
    "REASON": "ICECandidate",
    "TARGET_PHONE_NUMBER": "1212121212",
    "CANDIDATE": "ICE Candidate"
}
```
***
#### Hang Up: ""ws://your_adress:4000""
```
{
    "REASON": "HangUp",
    "CALLER_PHONE_NUMBER": "1234567890",
    "TARGET_PHONE_NUMBER": "1212121212"
}
```