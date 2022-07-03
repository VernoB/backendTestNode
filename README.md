# Start

to start the application you need to run npm start

# After

To work with the application you need first to register a new profile, the authentication it's no neccessary for that and after authenticate your self with the provide email and password.

you can later try to fetch, edit or get profiles from the database with
POST : /user/register => for register a new user with firstname, lastname, email, password,and image as parameters
POST: /user/login => to authenticate your self with email and password
PUT: /profile/:id => to modify a specific profile or user without password and id parameter
GET: /profile/:id => to fetch a specific profile with a given id
GET: /profile/?page=1 => to fetch paginated profile

# database

the database generated is called apibackend_users.sql

thank for your times
