from pymongo import MongoClient
def get_db(db_name, host, port, username, password):

 client = MongoClient(host=host,
                      port=int(host),
                      username=username,
                      password=password
                     )
 db_handle = client['db_name']
 return db_handle, client
