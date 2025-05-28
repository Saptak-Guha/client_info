Using Django(Backend) + React(Frontend) + MongoDB(Database)
Just for fun and tackling complexity.


Django 8000
React 5173
Mongo (default)

This project started to help and store information of clients in our office.
Now has escalated to a product of a B2B system (Mannufacturer to Retailer).
And keep track of everything.


2:42 am 26th April 
- Connected React + Mongo + Django

GET clients:
curl -X GET http://127.0.0.1:8000/clients/


POST clients:
curl -X POST http://127.0.0.1:8000/clients/      -H "Content-Type: application/json"      -d '{"name": "John Doe", "password": "helloxy23", "pan": "27DAUF23Q", "email":"debasis@dummy.com", "phone": "843083492"}'


need to make a client end.
where users can also register themselves.

and can chat with the server for issues.
need to use channels and will use Redis caching to load N recent messages quickly.



Backend Assumptions:
POST /login/ expects { "username": ..., "password": ... } and returns { "success": "true", "_id": "..." } on success.

POST /chat/ expects { "_id": "...", "message": "..." } and returns { "reply": "..." }.

connected finally what a fckin' headache, chat system integrated and that too uses Redis cache for in-memory storage and a fast realtime loading.  



Well the project has escalated to a startup. So the repo is made pvt.


write important commands and all here!.

May 29th 3:52am 

- updated end to end system
to - do:
- need a db schema for delivery and transactions 
- need razorpay and delhivery status boards! 
