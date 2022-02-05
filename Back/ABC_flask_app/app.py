from flask import Flask,request, jsonify
from flask_restful import Api,Resource
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import json
from flask_login import UserMixin
from flask_login import LoginManager
from flask_login import login_user
from flask_login import login_required, current_user, logout_user

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///abc.db'
app.config['SECRET_KEY'] = 'super-secret-key-here'

db = SQLAlchemy(app)
ma = Marshmallow(app)
api = Api(app)
login_manager = LoginManager()
login_manager.init_app(app)
#login_manager.session_protection = None

class User(UserMixin,db.Model):
	id = db.Column(db.Integer, primary_key=True)
	email = db.Column(db.String(100), unique=True)
	password = db.Column(db.String(100))
	nombre = db.Column(db.String(500))

class Evento(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	nombre = db.Column(db.String(1000))
	categoria = db.Column(db.String(100))
	lugar = db.Column(db.String(500))
	direccion = db.Column(db.String(200))
	fecha_inicio = db.Column(db.Date())
	fecha_fin = db.Column(db.Date())
	tipo = db.Column(db.String(200))
	user_mail = db.Column(db.String(100))

@login_manager.user_loader
def load_user(user_id):
	return User.query.get(int(user_id))

class User_Schema(ma.Schema):
	class Meta:
		fields = ("email", "nombre")

class Evento_Schema(ma.Schema):
	class Meta:
		fields = ("id","nombre","categoria","lugar","direccion","fecha_inicio","fecha_fin","tipo","user_mail")

user_schema = User_Schema()
evento_schema = Evento_Schema()
eventos_schema = Evento_Schema(many = True)

class RecursoIndex(Resource):
	def get(self):
		return "Index"

class RecursoProfile(Resource):
	def get(self):
		return "Profile"

class RecursoLogin(Resource):
	def post(self):
		email_form = request.form.get("email")
		password = request.form.get("password")

		user = User.query.filter_by(email=email_form).first()

		if not user or not check_password_hash(user.password, password):
			responseDict = {
				"message": "Login Incorrecto"
			}
			response = jsonify(responseDict)
			response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
			response.headers.add('Access-Control-Allow-Credentials', 'true')
			return response
		login_user(user)
		result = user_schema.dump(user)
		response = user_schema.jsonify(result)
		response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
		response.headers.add('Access-Control-Allow-Credentials', 'true')
		return response

class RecursoSignUp(Resource):
	def post(self):
		email_form = request.form.get("email")
		password = request.form.get("password")
		password_enc = generate_password_hash(password, method='sha256')

		# Validar si el usuario existe
		user = User.query.filter_by(email=email_form).first()
		if user:
			responseDict = {
				"message": "El usuario ya existe"
			}
			return json.dumps(responseDict)

		nuevo_Usuario = User(
			email = email_form,
			nombre = request.form.get("nombre"),
			password = password_enc)
		db.session.add(nuevo_Usuario)
		db.session.commit()
		return user_schema.dump(nuevo_Usuario)

class RecursoLogOut(Resource):
	@login_required
	def get(self):
		logout_user()
		responseDict = {
			"message": "El usuario se ha desconectado exitosamente"
		}
		response = jsonify(responseDict)
		response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
		response.headers.add('Access-Control-Allow-Credentials', 'true')
		return response

# Recursos de eventos
class RecursoListarEventos(Resource):
	def get(self):
		eventos_all = Evento.query.all()
		return eventos_schema.dump(eventos_all)
	def post(self):
		fecha_inicio_obj = datetime.strptime(request.form.get("fecha_inicio"),'%Y-%m-%d').date()
		fecha_fin_obj = datetime.strptime(request.form.get("fecha_fin"),'%Y-%m-%d').date()
		nuevo_evento = Evento(
			nombre = request.form.get("nombre"),
			categoria = request.form.get("categoria"),
			lugar = request.form.get("lugar"),
			direccion = request.form.get("direccion"),
			fecha_inicio = fecha_inicio_obj,
			fecha_fin = fecha_fin_obj,
			tipo = request.form.get("tipo"),
			user_mail = request.form.get("user_mail"))
		db.session.add(nuevo_evento)
		db.session.commit()
		return evento_schema.dump(nuevo_evento)

class RecursoListarEventosUsuario(Resource):
	@login_required
	def get(self):
		mail = current_user.email
		eventos_usuario = Evento.query.filter_by(user_mail=mail)
		result = eventos_schema.dump(eventos_usuario)
		response = eventos_schema.jsonify(result)
		response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
		response.headers.add('Access-Control-Allow-Credentials', 'true')
		return response


class RecursoUnEvento(Resource):
	def get(self, id_evento):
		evento = Evento.query.get_or_404(id_evento)
		return evento_schema.dump(evento)

api.add_resource(RecursoIndex,'/')
api.add_resource(RecursoProfile,'/profile')
api.add_resource(RecursoLogin,'/login')
api.add_resource(RecursoSignUp,'/signup')
api.add_resource(RecursoLogOut,'/logout')
api.add_resource(RecursoListarEventos,'/eventos')
api.add_resource(RecursoListarEventosUsuario,'/eventosUsuario')
api.add_resource(RecursoUnEvento,'/eventos/<int:id_evento>')

if __name__ == '__main__':
	app.run(debug=True)
