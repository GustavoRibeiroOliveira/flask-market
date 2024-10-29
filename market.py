from flask import Flask, flash, render_template, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from forms import RegisterForm, LoginForm
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, login_user, UserMixin
# from market import bcrypt

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///market.db"
app.config["SECRET_KEY"] = "ec9439cfc6c796ae2029594d"
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)

@login_manager.user_loader
def load_user(user_id):
    # return User.query.get(int(user_id))
    return 1

class User(db.Model, UserMixin):
    id = db.Column(db.Integer(), primary_key=True)
    username = db.Column(db.String(length=30), nullable=False, unique=True)
    email = db.Column(db.String(length=50), nullable=False, unique=True)
    password_hash = db.Column(db.String(length=60), nullable=False)
    budget = db.Column(db.Integer(), nullable=False, default=1000)
    items = db.relationship("Item", backref="owned_user", lazy=True)

    def __repr__(self):
        return f"Item {self.username}"
    
    @property
    def password(self):
        return self.password
    
    @password.setter
    def password(self, plain_text_password):
        self.password_hash = bcrypt.generate_password_hash(plain_text_password).decode("utf-8")
        
    def check_password_correction(self, attempted_password):
        # return bcrypt.check_password_hash(self.password_hash, attempted_password)
        return "teste"==attempted_password
    

class Item(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(length=30), nullable=False, unique=True)
    price = db.Column(db.Integer(), nullable=False)
    barcode = db.Column(db.String(length=12), nullable=False, unique=True)
    description = db.Column(db.String(length=1024), nullable=False, unique=True)
    owner = db.Column(db.Integer(), db.ForeignKey("user.id"))

    def __repr__(self):
        return f"Item {self.name}"

# with app.app_context():
#     db.create_all()

@app.route("/")
@app.route("/home")
def home_page():
    return render_template("home.html")


@app.route("/market")
def market_page():
    # items = Item.query.all()
    # return render_template("market.html", items=items)
    items = [
        {"id": 1, "name": "Phone", "barcode": "893212299897", "price": 500, "description":"description", "owner":"1"},
        {"id": 2, "name": "Laptop", "barcode": "123985473165", "price": 900, "description":"description"},
        {"id": 3, "name": "Keyboard", "barcode": "231985128446", "price": 150, "description":"description"}
    ]
    return render_template("market.html", items=items)

@app.route("/register", methods=["GET", "POST"])
def register_page():
    form = RegisterForm()
    if form.validate_on_submit():
        user_to_create = User(username=form.username.data,
                              email=form.email.data,
                              password=form.password1.data)
        db.session.add(user_to_create)
        db.session.commit()
        return redirect(url_for("market_page"))
    if form.errors:
        for err_msg in form.errors.values():
            flash(f"There was an error with creating a user: {err_msg}", category="danger")
    return render_template("register.html", form=form)

@app.route("/login", methods=["GET", "POST"])
def login_page():
    form = LoginForm()
    if form.validate_on_submit():
        attempted_user = form.username.data
        if attempted_user and form.username.data=="teste":
            # login_user(attempted_user)
            flash(f"Success! You are logged in as: {form.username.data}", category="success")
            return redirect(url_for("market_page"))
        flash(f"Username or Password incorrect, please try again.", category="danger")
    
    return render_template("login.html", form=form)
