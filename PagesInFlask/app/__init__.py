from datetime import datetime
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_socketio import SocketIO, send
import os
import psycopg2


os.environ['DATABASE_URL'] = 'postgres://melguiqtptingg:59490593b602713ec33c19e0a871d3a8576c84364788e6538e04c5aecb51ee70@ec2-18-235-20-228.compute-1.amazonaws.com:5432/d26m0edev55i4s'
DATABASE_URL = os.environ['DATABASE_URL']
conn = psycopg2.connect(DATABASE_URL, sslmode='require')
app = Flask(__name__)
app.config['SECRET_KEY'] = '508d2c80b4056ad1e9d9969224d3fcbd'
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
socketio = SocketIO(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message_category = 'info'

from app import routes
