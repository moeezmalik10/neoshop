# NeoShop - E-Commerce Platform

A modern, responsive e-commerce platform built with vanilla JavaScript and PHP backend.

## Features

- 🛍️ Product catalog with 3D visualization
- 🛒 Shopping cart and wishlist functionality
- 👤 User authentication and registration
- 📱 Responsive design for all devices
- 🎨 Modern UI with WebGL animations
- 🔐 Secure JWT-based authentication
- 📊 Admin dashboard for product management
- 💳 Order management system

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3, WebGL
- **Backend**: PHP 7.4+, MySQL
- **Authentication**: JWT tokens
- **Database**: MySQL with PDO

## Setup Instructions

### Prerequisites

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Web server (Apache/Nginx) or XAMPP/WAMP

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/neoshop.git
   cd neoshop
   ```

2. **Configure the database**
   - Create a MySQL database named `neoshop`
   - Update database credentials in `backend/config.php` or create a `.env` file

3. **Set up environment variables**
   ```bash
   cp backend/env.example .env
   ```
   Edit `.env` file with your database credentials:
   ```
   NEOSHOP_DB_HOST=127.0.0.1
   NEOSHOP_DB_PORT=3306
   NEOSHOP_DB_NAME=neoshop
   NEOSHOP_DB_USER=your_username
   NEOSHOP_DB_PASS=your_password
   ```

4. **Run database migrations**
   ```bash
   php backend/run_migration.php
   ```

5. **Set up admin user**
   ```bash
   php backend/setup_admin.php
   ```

6. **Configure web server**
   - Point your web server to the project root directory
   - Ensure PHP backend is accessible at `/backend/`

### Development Setup

For local development with XAMPP:

1. Place the project in `htdocs/neoshop/`
2. Start Apache and MySQL services
3. Access via `http://localhost/neoshop/`

### API Configuration

Update `js/config.js` to point to your backend:
```javascript
window.NEOSHOP_API_BASE = 'http://localhost/neoshop/backend';
```

## Project Structure

```
neoshop/
├── backend/           # PHP backend API
│   ├── config.php    # Database configuration
│   ├── db.php        # Database connection
│   ├── migrations.sql # Database schema
│   └── public/       # API endpoints
├── css/              # Stylesheets
├── js/               # JavaScript modules
│   ├── store/        # State management
│   ├── views/        # Page components
│   └── utils/        # Utility functions
├── data/             # JSON data files
└── index.html        # Main application
```

## API Endpoints

- `GET /backend/public/` - API status
- `POST /backend/public/auth.php` - Authentication
- `GET /backend/public/products.php` - Product catalog
- `POST /backend/public/orders.php` - Order management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue on GitHub.
