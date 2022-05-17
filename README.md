# Database & Signal Server

This repository contains a PostgeSQL based REST application and a WS based signal server. It's designed to  to store users with a phonenumber and handle call requests by exchanging SDP data and ICE candidates. Take note that database security is not guaranteed, as the local managment and setup is just as important as it's management in code.

## Setup & Installation
NodeJS, NPM and PostgreSQL are the required dependecies you need to run this project. OpenSSL is also recommended for generating the SHA-256 key later on during setup.

### Installation on Linux (apt, wget)
NodeJS: ```sudo apt install nodejs```\
NPM: ```sudo apt install npm```\
PostgreSQL:
* ```sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'```
* ```wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -```
* ```sudo apt-get update```
* ```sudo apt-get -y install postgresql```

OpenSSL: https://github.com/openssl/openssl/blob/master/INSTALL.md#installing-openssl (Optional) 

### Installation on Windows
NodeJS & NPM: https://nodejs.org/en/download/ \
PostgreSQL: https://www.postgresql.org/download/windows/ \
OpenSSL: https://slproweb.com/products/Win32OpenSSL.html (Optional)

### Setup
First you need to install all the NodeJS dependencies, this is done by running the command ```npm install``` while inside the project folder. It's also highly recommended to globally install PM2 with the command ```npm install pm2@latest -g```. PM2 allows advanced controlling and monitoring of processes both locally and remote through a webbrowser.

Once the required dependencies are installed you need to generate a SHA-256 key in the ./keys folder with the name of *tokenSecret.key*. This can be done using OpenSSL with the command ```openssl genrsa -out tokenSecret.key 4096``` while in the keys folder.

To generate the required database use the database.sql file containing the two schemas used for the user and contact table. This can be done while connected to the database with the correct user privileges.

When you have a key and the database is setup simply type ```npm start``` to start the servers or ```npm test``` to run the tests. The launch variables and dependencies can be changed in *package.json*.

## Server Communication
To use the database and signal server, HTTP and websocket clients are required. It's highly recommended to use *Postman* to manually test the HTTP and websocket requests. Both servers use JSON as the dataformat to be sent and received.

### <ins>Databaseserver Communication</ins>
#### Create a User: *http://your_adress:8080/create_user* (POST Request)
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
#### Login a User: *http://your_adress:8080/login* (POST Request)
```
{
    "email": "somenice@domain.yup",
    "password": "SuperSecure"
}
```
* Returns JWT token for future verification
***
#### Authenticate a User: *http://your_adress:8080/authenticate* (GET Request)
Header (authorization): *(User's JWT token)*
```
{}
```
* Returns JWT token for future verification
***
#### Add a Contact: *http://your_adress:8080/add_contact* (POST Request)
Header (authorization): *(User's JWT token)*
```
{
    "contact_phonenumber": "1212121212"
}
```
***
#### Get User Data: *http://your_adress:8080/get_user* (GET Request)
Header (authorization): *(User's JWT token)*
```
{}
```
* Returns users name, email and phone number
***
#### Get Contacts: *http://your_adress:8080/get_contacts* (GET Request)
Header (authorization): *(User's JWT token)*
```
{}
```
* Returns contacts in a list with their username, email and phone number
***
#### Delete Contact: *http://your_adress:8080/delete_contact* (DELETE Request)
Header (authorization): *(User's JWT token)*
```
{
    "contact_phonenumber": "1212121212"
}
```
***
#### Modify Firstname: *http://your_adress:8080/put_firstname* (PUT Request)
Header (authorization): *(User's JWT token)*
```
{
    "firstname": "aNewFirstname"
}
```
***
#### Modify Lastname: *http://your_adress:8080/put_lastname* (PUT Request)
Header (authorization): *(User's JWT token)*
```
{
    "lastname": "aNewLastname"
}
```
***
#### Modify Phonenumber: *http://your_adress:8080/put_phonenumber* (PUT Request)
Header (authorization): *(User's JWT token)*
```
{
    "phonenumber": "1313131313"
}
```
***
#### Get Password Reset Email: *http://your_adress:8080/get_reset_password_code* (GET Request)
```
{
    "email": "somenice@domain.yup"
}
```
***
#### Verify Reset Password Code: *http://your_adress:8080/verify_reset_password_code* (GET request)
```
{
    "email": "somenice@domain.yup",
    "verify_code": "EXAMPLE123"
}
```
* Returns password reset token.
***
#### Modify Password: *http://your_adress:8080/put_password* (PUT Request)
Header (authorization): *(Password Reset Token)*
```
{
    "email": "somenice@domain.yup",
    "new_password": "betterPassword123"
}
```

&nbsp;

### <ins>Signalserver Communication</ins>
#### Connect: *ws://your_adress:4000*
```
{
    "REASON": "connect",
    "TOKEN": "usersJWTTokenShouldBeHere"
}
```
***
#### Call: *ws://your_adress:4000*
```
{
    "REASON": "call",
    "SENDER_PHONE_NUMBER": "1234567890",
    "RECEIVER_PHONE_NUMBER": "1212121212",
    "SDP": "*SDP Request*"
}
```
***
#### Call Response: *ws://your_adress:4000*
```
{
    "REASON": "callResponse",
    "RESPONSE": "accept",                   // or "deny"
    "SENDER_PHONE_NUMBER": "1212121212",
    "RECEIVER_PHONE_NUMBER": "1234567890",
    "SDP": "*SDP Request*"
}
```
***
#### Send ICE Candidate: *ws://your_adress:4000*
```
{
    "REASON": "ICECandidate",
    "RECEIVER_PHONE_NUMBER": "1212121212",
    "SENDER_PHONE_NUMBER": "1234567890"
    "CANDIDATE": "ICE Candidate"
}
```
***
#### Hang Up: *ws://your_adress:4000*
```
{
    "REASON": "HangUp",
    "SENDER_PHONE_NUMBER": "1234567890",
    "RECEIVER_PHONE_NUMBER": "1212121212"
}
```

## TURN Server for WebRTC
It's recommended to use CoTurn as a TURN server. This has been tested with the project and works once setup correctly. CoTurn can be found here: https://github.com/coturn/coturn

## Nodemailer
To send out email to users wanting to change their password, nodemailer is used. You can use your own choice of SMTP service but gmail is used by default and a link to how it's setup is specified in the .env file. To login with gmail OAuth2 is used with a refresh- and access-token.

## Possible Feature Updates
* Implement a none BOM destructive html parser
* Use PM2 clusters to improve performance of server
* Add custom PM2 metrics
* Add websocket and email testing
* Add SSL/TLS for websocket and HTTP requests
* Create an admin panel to monitor and control the services
* Use .ENV vault to store cross-service keys and secure values
* Seperate the REST API and the signal API
* Implement automatic serialization och creation of database
* Migrate to a distributed database model
* Automatically get email from websocket connection request and remove the field in WS requests
* Add brute-force attack protection
* Add a reverse-proxy with a balance loader (NGINX)
* Improve SQL schematic for better field requirements
* Implement docker for easier deployment