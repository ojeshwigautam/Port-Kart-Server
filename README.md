# Port-Kart-Server

Backend for Port-Kart — a small Express API that uses Supabase for authentication and data storage. This README documents setup, environment variables, database / RPC notes, and the full API reference (endpoints, HTTP methods, expected payloads and responses).

---

## Quick Start

- Install dependencies:

```powershell
cd Port-Kart-Server
pnpm install
```

- Run locally (ensure `.env` is set):

```powershell
pnpm start
```

The server listens on the port defined by the `PORT` environment variable.

---

## Required Environment Variables

- `PORT` — port the server listens on (e.g. `3001`).
- `FRONTEND_URL` — frontend origin used for CORS (e.g. `http://localhost:5173`).
- `SUPABASE_URL` — your Supabase project URL.
- `SUPABASE_ANON_KEY` — your Supabase anon/public key used by server (for RPC calls and minimal access patterns).
- `SELLER_SECRET` — a secret code used to validate seller registrations when creating profiles.

Create a `.env` file in `Port-Kart-Server/` with these values for local development.

---

## Database / Migrations / RPCs

- The project expects several tables and RPC functions in Supabase (see `supabase/migrations/` in the frontend repo):
  - Tables: `profiles`, `products`, `cart_items`, `orders`.
  - RPCs/SQL functions used by the server: `add_to_cart`, `update_cart_quantity`, `remove_from_cart` — these are executed via `supabase.rpc(...)` in the cart controllers.

Make sure the SQL migrations in `Port-Kart/supabase/migrations/` have been applied to your Supabase instance.

---

## Server Overview

- Entry point: `index.js` — mounts routes under `/api/*`:
  - `/api/auth` — auth routes
  - `/api/profile` — profile routes
  - `/api/cart` — cart routes
  - `/api/checkout` — checkout
  - `/api/orders` — orders
  - `/api/products` — products
  - `/api/seller` — seller endpoints

- Supabase client helper: `lib/supabaseClient.js` — reads `SUPABASE_URL` and `SUPABASE_ANON_KEY` from env.

---

## Full API Reference — Endpoints, Payloads & Responses

Base URL: `{{SERVER_URL}}` (e.g. `http://localhost:3001`)

All endpoints accept and return JSON. For endpoints that require authentication by token, include header:

```
Authorization: Bearer <ACCESS_TOKEN>
```

### Auth

- `POST /api/auth/signup`
  - Description: Create a new Supabase auth user.
  - Payload: `{ "email": "user@example.com", "password": "secret" }`
  - Success: `201` — returns Supabase signUp `data` object (user/session info when available).
  - Errors: `400` if payload incomplete; Supabase error otherwise.

- `POST /api/auth/login`
  - Description: Sign in with email/password.
  - Payload: `{ "email": "user@example.com", "password": "secret" }`
  - Success: `200` — Supabase sign-in `data` (includes access token and user info).

- `GET /api/auth/me`
  - Description: Retrieve user details from a Supabase access token.
  - Headers: `Authorization: Bearer <ACCESS_TOKEN>`
  - Success: `200` — returns a user object: `{ id, email, ... }`.

- `POST /api/auth/logout`
  - Description: Client-side should clear tokens; server returns success.
  - Payload: none
  - Success: `200` — `{ message: "Logged out" }`

### Profile

- `POST /api/profile/create-user-profile`
  - Description: Insert a profile row after successful auth signup.
  - Payload: `{ "id": "<auth-user-id>", "name": "Jane Doe", "email": "jane@x.com", "role": "customer|seller", "sellerCode": "<optional>" }`
  - Notes: If `role` is `seller`, `sellerCode` must equal `SELLER_SECRET` env var; otherwise role is forced to `customer`.
  - Success: `201` — returns inserted profile row(s).

- `POST /api/profile/get-user-profile`
  - Description: Get minimal profile info (name, role) by user id.
  - Payload: `{ "userId": "<auth-user-id>" }`
  - Success: `200` — `{ "name": "Jane Doe", "role": "customer" }`

- `GET /api/profile/get-total-users`
  - Description: Returns all profiles (used for admin/metrics).
  - Success: `200` — array of profile rows; Supabase `select(..., { count: 'exact' })` is used.

### Products

- `GET /api/products/get-products`
  - Description: List products with seller name attached.
  - Success: `200` — array of products, each typically including `id, title, description, price, stock, seller_id, seller: { name }`.

- `POST /api/products/create-product`
  - Description: Create a product (seller-only operation expected by app).
  - Payload (example):
    ```json
    {
      "title": "Blue T-shirt",
      "description": "100% cotton",
      "price": 1999,
      "stock": 10,
      "seller_id": "<seller-user-id>",
      "image_url": "https://..."
    }
    ```
  - Success: `200` — inserted product row(s) returned.

- `POST /api/products/update-product-stock`
  - Description: Adjust product stock by a numeric delta.
  - Payload: `{ "productId": "<id>", "change": -1 }` (change can be positive or negative)
  - Success: `200` — updated product row(s).

- `POST /api/products/delete-product`
  - Description: Delete a product by id.
  - Payload: `{ "productId": "<id>" }`
  - Success: `200` — deleted row(s).

### Cart

- `POST /api/cart/add-to-cart`
  - Description: Add product to a user's cart via Supabase RPC `add_to_cart`.
  - Payload: `{ "userId": "<auth-user-id>", "productId": "<product-id>" }`
  - Success: `200` — RPC result (depends on your SQL function implementation).

- `POST /api/cart/get-cart-items`
  - Description: Get cart items for a user, with nested product title & price.
  - Payload: `{ "userId": "<auth-user-id>" }`
  - Success: `200` — array of `cart_items` rows with `product: { title, price }` included.

- `POST /api/cart/update-cart-quantity`
  - Description: Change quantity for a cart item via RPC `update_cart_quantity`.
  - Payload: `{ "userId": "<auth-user-id>", "productId": "<product-id>", "quantity": 2 }`
  - Success: `200` — RPC result.

- `POST /api/cart/remove-from-cart`
  - Description: Remove an item using RPC `remove_from_cart`.
  - Payload: `{ "userId": "<auth-user-id>", "productId": "<product-id>" }`
  - Success: `200` — RPC result.

### Checkout & Orders

- `POST /api/checkout/checkout`
  - Description: Create `orders` rows from cart items, deduct product stock, and clear the cart.
  - Payload: `{ "userId": "<auth-user-id>", "address": "Shipping address string" }`
  - Behavior: reads `cart_items` for `userId`, builds `orders` rows (includes `product_name`, `total_price`), updates product `stock` values, deletes `cart_items` for the user.
  - Success: `200` — `{ "success": true, "message": "Order placed! We be sailin' to <address>." }`

- `POST /api/orders/get-orders`
  - Description: Fetch orders for a user.
  - Payload: `{ "userId": "<auth-user-id>" }`
  - Success: `200` — array of order rows (`product_name`, `quantity`, `total_price`, `created_at`, ...).

### Seller

- `POST /api/seller/get-my-products`
  - Description: Get products created by a seller.
  - Payload: `{ "sellerId": "<seller-user-id>" }`
  - Success: `200` — array of products.

- `POST /api/seller/get-selling-history`
  - Description: Get orders where `seller_id` equals the seller.
  - Payload: `{ "sellerId": "<seller-user-id>" }`
  - Success: `200` — array of orders with nested product metadata.

---

## Error Handling

- Controllers use `handleSupabaseError(res, error)` to standardize Supabase errors.
- Common status codes used:
  - `400` — bad request / missing parameters
  - `401` / `403` — auth or permission related (Supabase error statuses)
  - `500` — internal server error

---

## Example curl Requests

Signup:
```bash
curl -X POST '{{SERVER_URL}}/api/auth/signup' \
  -H 'Content-Type: application/json' \
  -d '{"email":"jane@x.com","password":"secret"}'
```

Add to cart:
```bash
curl -X POST '{{SERVER_URL}}/api/cart/add-to-cart' \
  -H 'Content-Type: application/json' \
  -d '{"userId":"<auth-id>","productId":"<product-id>"}'
```

Checkout:
```bash
curl -X POST '{{SERVER_URL}}/api/checkout/checkout' \
  -H 'Content-Type: application/json' \
  -d '{"userId":"<auth-id>","address":"221B Baker St"}'
```

---

## Development Notes

- The server is intentionally lightweight and delegates DB operations to Supabase. For production, consider:
  - Using a secure service key for server-to-supabase operations where needed (not the anon key), and restricting access appropriately.
  - Adding request validation and rate limiting.
  - Adding unit / integration tests for controller logic.

---

If you want, I can:
- Commit this README and push to a branch, or commit directly to `master`.
- Generate Postman collection or OpenAPI spec from these endpoints.
