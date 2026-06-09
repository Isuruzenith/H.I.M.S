from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.routes.auth_routes import auth_bp
from app.routes.admin_routes import admin_bp
from app.routes.audit_routes import audit_bp
from app.routes.dashboard_routes import dashboard_bp
from app.routes.health_routes import health_bp
from app.routes.inventory_routes import inventory_bp
from app.routes.purchase_order_routes import purchase_order_bp
from app.routes.report_routes import report_bp
from app.routes.stock_routes import stock_bp
from app.routes.supplier_routes import supplier_bp
from app.routes.bi_routes import bi_bp


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, origins=Config.CORS_ORIGINS, supports_credentials=True)

    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(audit_bp, url_prefix="/api/audit")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(inventory_bp, url_prefix="/api")
    app.register_blueprint(supplier_bp, url_prefix="/api")
    app.register_blueprint(stock_bp, url_prefix="/api/stock")
    app.register_blueprint(purchase_order_bp, url_prefix="/api/purchase-orders")
    app.register_blueprint(report_bp, url_prefix="/api/reports")
    app.register_blueprint(bi_bp, url_prefix="/api/bi")

    return app
