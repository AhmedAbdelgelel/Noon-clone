# E-Commerce API

A full-featured RESTful E-commerce API built with Node.js, Express, and MongoDB.

## Table of Contents

- [Overview](#overview)
- [Technologies](#technologies)
- [Features](#features)
- [Architecture](#architecture)
- [Data Models](#data-models)
- [API Endpoints](#api-endpoints)
- [Installation](#installation)
- [Usage](#usage)

## Overview

This project is a comprehensive E-commerce backend API that provides all the necessary functionality for running an online store. It includes user authentication, product management, shopping cart functionality, order processing, payment integration with Stripe, and more.

## Technologies

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **Stripe** - Payment processing
- **Multer & Sharp** - Image upload and processing
- **Swagger** - API documentation
- **Nodemailer** - Email functionality

## Features

### User Management

- **Authentication** - Signup, login, logout, password reset

  - Secure user registration with email verification
  - JWT-based authentication with refresh tokens
  - Password reset via email with secure tokens
  - Protection against brute force attacks

- **Authorization** - Role-based access control (User, Admin, Manager)

  - Granular permission system based on user roles
  - Middleware for protecting routes based on user roles
  - Access control for sensitive operations

- **Profile Management** - Update profile, change password

  - User profile with personal information
  - Profile image upload and processing
  - Secure password change functionality

- **Address Management** - Add, update, delete shipping addresses
  - Multiple shipping addresses per user
  - Default address selection
  - Address validation and formatting

### Product Management

- **Categories & Subcategories** - Hierarchical product organization

  - Nested category structure with unlimited depth
  - Category image management
  - Automatic slug generation for SEO-friendly URLs

- **Brands** - Product brand management

  - Brand registration with logo upload
  - Brand filtering and searching
  - Brand-specific product collections

- **Products** - CRUD operations with image upload

  - Detailed product information with multiple images
  - Product variants (size, color, etc.)
  - Inventory management with stock tracking
  - Rich text description with HTML support

- **Search & Filtering** - Advanced product search and filtering options
  - Full-text search across product fields
  - Filter by category, brand, price range, ratings
  - Sorting options (newest, price, popularity)
  - Pagination for large result sets

### Shopping Experience

- **Wishlist** - Save products for later

  - Add/remove products from wishlist
  - Move items from wishlist to cart
  - Persistent wishlist across sessions

- **Shopping Cart** - Add, update, remove products

  - Real-time cart management
  - Quantity adjustments with inventory validation
  - Price calculations including discounts
  - Cart persistence across sessions

- **Reviews & Ratings** - Product review system
  - Star ratings with average calculation
  - Text reviews with moderation options
  - Verified purchase badges
  - Helpful review voting system

### Order Processing

- **Checkout** - Convert cart to order

  - Multi-step checkout process
  - Address selection or creation
  - Order summary with final price calculation
  - Coupon application at checkout

- **Payment Options** - Cash on delivery or credit card via Stripe

  - Secure Stripe integration for card payments
  - Cash on delivery option with address verification
  - Payment status tracking
  - Refund processing capabilities

- **Order Tracking** - Track order status (paid, delivered)
  - Real-time order status updates
  - Delivery tracking information
  - Order history for users
  - Email notifications for status changes

### Discount System

- **Coupons** - Apply discount coupons to cart
  - Percentage and fixed amount discounts
  - Time-limited coupon validity
  - Usage limits per coupon and per user
  - Category or product-specific coupons

## Architecture

The application follows a modular MVC (Model-View-Controller) architecture:

- **Models**: Mongoose schemas defining the data structure
- **Controllers**: Business logic handling requests and responses
- **Routes**: API endpoint definitions and request routing
- **Middlewares**: Request processing, authentication, validation
- **Utils**: Helper functions and utilities

The application uses a layered architecture:

1. **Presentation Layer**: API endpoints, request/response handling
2. **Business Logic Layer**: Controllers implementing business rules
3. **Data Access Layer**: Models interacting with the database
4. **Infrastructure Layer**: Configuration, logging, error handling

## Data Models

### User Model

- Core user information (name, email, password)
- Role-based permissions
- Password encryption with bcrypt
- Password reset token generation and verification

### Product Model

- Product details (title, description, price)
- Relationships to categories and brand
- Image storage and processing
- Inventory tracking (quantity, sold count)
- SEO-friendly slugs

### Order Model

- Order items with references to products
- Shipping and billing information
- Payment status tracking
- Delivery status tracking
- Price calculations including tax and shipping

### Cart Model

- Shopping cart items with product references
- Quantity and color selections
- Price calculations
- Coupon application logic

### Review Model

- Product ratings and review text
- User reference for review author
- Timestamps for creation and updates
- Helpful vote tracking

## API Endpoints

### Authentication

- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/forgotPassword` - Request password reset
- `POST /api/v1/auth/resetPassword` - Reset password with token

### Categories

- `GET /api/v1/categories` - Get all categories
- `POST /api/v1/categories` - Create new category (Admin)
- `GET /api/v1/categories/:id` - Get specific category
- `PUT /api/v1/categories/:id` - Update category (Admin)
- `DELETE /api/v1/categories/:id` - Delete category (Admin)

### Products

- `GET /api/v1/products` - Get all products with filtering
- `POST /api/v1/products` - Create new product (Admin)
- `GET /api/v1/products/:id` - Get specific product
- `PUT /api/v1/products/:id` - Update product (Admin)
- `DELETE /api/v1/products/:id` - Delete product (Admin)

### Reviews

- `GET /api/v1/reviews` - Get all reviews
- `POST /api/v1/reviews` - Create product review (User)
- `GET /api/v1/reviews/:id` - Get specific review
- `PUT /api/v1/reviews/:id` - Update review (User/Admin)
- `DELETE /api/v1/reviews/:id` - Delete review (User/Admin)

### Cart

- `GET /api/v1/carts` - Get user cart
- `POST /api/v1/carts` - Add product to cart
- `PUT /api/v1/carts/:itemId` - Update cart item
- `DELETE /api/v1/carts/:itemId` - Remove item from cart
- `DELETE /api/v1/carts` - Clear cart

### Wishlist

- `GET /api/v1/wishlist` - Get user wishlist
- `POST /api/v1/wishlist` - Add product to wishlist
- `DELETE /api/v1/wishlist/:productId` - Remove from wishlist

### Orders

- `POST /api/v1/orders/:cartId` - Create cash order
- `GET /api/v1/orders` - Get all orders (User: own orders, Admin: all)
- `GET /api/v1/orders/:id` - Get specific order
- `PUT /api/v1/orders/:id/pay` - Update order to paid (Admin)
- `PUT /api/v1/orders/:id/deliver` - Update order to delivered (Admin)
- `GET /api/v1/orders/checkout-session/:cartId` - Create Stripe checkout session

### Addresses

- `GET /api/v1/addresses` - Get user addresses
- `POST /api/v1/addresses` - Add new address
- `PUT /api/v1/addresses/:addressId` - Update address
- `DELETE /api/v1/addresses/:addressId` - Delete address

### Coupons

- `GET /api/v1/coupons` - Get all coupons (Admin)
- `POST /api/v1/coupons` - Create coupon (Admin)
- `PUT /api/v1/coupons/:id` - Update coupon (Admin)
- `DELETE /api/v1/coupons/:id` - Delete coupon (Admin)

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Set up environment variables
# Create a .env file with the following variables:
# PORT=8000
# NODE_ENV=development
# BASE_URL=http://localhost:8000
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# JWT_EXPIRES_IN=90d
# EMAIL_USERNAME=your_email_username
# EMAIL_PASSWORD=your_email_password
# EMAIL_HOST=smtp.example.com
# EMAIL_PORT=587
# STRIPE_SECRET=your_stripe_secret_key
```

## Usage

```bash
# Run in development mode
npm run start:dev

# Run in production mode
npm run start:prod

# Access API documentation
# Visit http://localhost:8000/api-docs
```

API documentation is available via Swagger UI at the `/api-docs` endpoint when the server is running.

# Noon-clone

# Noon-clone
