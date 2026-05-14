from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from functools import wraps
import os
import cloudinary
from cloudinary.uploader import upload


app = Flask(__name__)
app.secret_key = os.environ.get(
    "SECRET_KEY",
    "dev-secret-key"
)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    "DATABASE_URL",
    "sqlite:///affiliate.db"
)
cloudinary.config(

    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# app.config['UPLOAD_FOLDER'] = os.path.join('static', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB max
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}

db = SQLAlchemy(app)

# ─── Models ───────────────────────────────────────────────

class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default='')
    image = db.Column(db.String(300), default='')
    order = db.Column(db.Integer, default=0)
    links = db.relationship('Link', backref='product', lazy=True, cascade='all, delete-orphan', order_by='Link.order')

class Link(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    label = db.Column(db.String(100), nullable=False)
    url = db.Column(db.Text, nullable=False)
    order = db.Column(db.Integer, default=0)

# ─── Helpers ──────────────────────────────────────────────

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated

# ─── Auth Routes ──────────────────────────────────────────

@app.route('/admin-dashboard/login', methods=['GET', 'POST'])
def login():
    if session.get('admin_logged_in'):
        return redirect(url_for('admin_dashboard'))
    error = None
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        admin = Admin.query.filter_by(username=username).first()
        if admin and admin.check_password(password):
            session['admin_logged_in'] = True
            session['admin_username'] = username
            return redirect(url_for('admin_dashboard'))
        error = 'Invalid username or password.'
    return render_template('adminlogin.html', error=error)

@app.route('/admin/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

# ─── Admin Routes ─────────────────────────────────────────

@app.route('/admin')
@login_required
def admin_dashboard():
    products = Product.query.order_by(Product.order).all()
    return render_template('admin_dashboard.html', products=products)

@app.route('/admin/product/add', methods=['POST'])
@login_required
def add_product():
    name = request.form.get('name', '').strip()
    description = request.form.get('description', '').strip()
    if not name:
        flash('Product name is required.', 'error')
        return redirect(url_for('admin_dashboard'))

    image_path = ''
    if 'image' in request.files:
     file = request.files['image']

    if file and file.filename and allowed_file(file.filename):

        upload_result = upload(file)

        image_path = upload_result['secure_url']

    max_order = db.session.query(db.func.max(Product.order)).scalar() or 0
    product = Product(name=name, description=description, image=image_path, order=max_order + 1)
    db.session.add(product)
    db.session.commit()

    # Save links
    labels = request.form.getlist('link_label[]')
    urls = request.form.getlist('link_url[]')
    for i, (label, url) in enumerate(zip(labels, urls)):
        label = label.strip()
        url = url.strip()
        if url:
            link = Link(product_id=product.id, label=label or 'Buy Now', url=url, order=i)
            db.session.add(link)
    db.session.commit()
    flash('Product added successfully!', 'success')
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/product/<int:product_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_product(product_id):
    product = Product.query.get_or_404(product_id)
    if request.method == 'POST':
        product.name = request.form.get('name', '').strip() or product.name
        product.description = request.form.get('description', '').strip()

        if 'image' in request.files:
          file = request.files['image']

          if file and file.filename and allowed_file(file.filename):

             upload_result = upload(file)

             product.image = upload_result['secure_url']

        # Clear and re-add links
        Link.query.filter_by(product_id=product.id).delete()
        labels = request.form.getlist('link_label[]')
        urls = request.form.getlist('link_url[]')
        for i, (label, url) in enumerate(zip(labels, urls)):
            label = label.strip()
            url = url.strip()
            if url:
                link = Link(product_id=product.id, label=label or 'Buy Now', url=url, order=i)
                db.session.add(link)

        db.session.commit()
        flash('Product updated!', 'success')
        return redirect(url_for('admin_dashboard'))
    return render_template('edit_product.html', product=product)

@app.route('/admin/product/<int:product_id>/delete', methods=['POST'])
@login_required
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    flash('Product deleted.', 'success')
    return redirect(url_for('admin_dashboard'))

# ─── Public Page ──────────────────────────────────────────

@app.route('/')
def root():
    return redirect(url_for("public_page"))

@app.route('/products')
def public_page():
    products = Product.query.order_by(Product.order).all()
    return render_template('public.html', products=products)

 # ─── Init ─────────────────────────────────────────────────

def init_db():
    with app.app_context():
        db.create_all()
        if not Admin.query.first():
            admin = Admin(username='octakid')
            admin.set_password('octakid@2610')
            db.session.add(admin)
            db.session.commit()
            print("Default admin created: username=admin, password=admin123")

if __name__ == '__main__':
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)