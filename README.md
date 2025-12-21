# E-commerce Store Management System

> A full-featured **e-commerce management platform** designed for **customers, store staff, and administrators**.  
>  
> The system provides:
> - A **shopping experience for customers** with product browsing, ordering, payment, and return requests.
> - An **admin & employee dashboard** to manage products, inventory, orders, shipping, and customer support.
> - An integrated **product recommendation service** that suggests related products based on user behavior.
>  
> This project was built for **learning and internship applications**, aiming to simulate a **real-world e-commerce workflow** and demonstrate how frontend, backend, and integrations work together in practice.

---

## Demo

> Some images of the client shopping website:
<p align="center">
  <img src="assets/client_home.png" alt="Client Home" width="20%" />
  <img src="assets/client_product_detail.png" alt="Product Detail" width="20%" />
  <img src="assets/client_cart.png" alt="Cart" width="20%" />
  <img src="assets/client_checkout.png" alt="Checkout" width="20%" />
  <img src="assets/client_orders.png" alt="Orders" width="20%" />
</p>

> Some images of the admin / employee dashboard:
<p align="center">
  <img src="assets/admin_dashboard.png" alt="Admin Dashboard" width="25%" />
  <img src="assets/admin_products.png" alt="Product Management" width="25%" />
  <img src="assets/admin_orders.png" alt="Order Management" width="25%" />
  <img src="assets/admin_inventory.png" alt="Inventory" width="25%" />
  <img src="assets/admin_returns.png" alt="Return Management" width="25%" />
</p>

> System and integration overview:
<p align="center">
  <img src="assets/swagger_ui.png" alt="Swagger UI" width="30%" />
  <img src="assets/erd_diagram.png" alt="Database Diagram" width="30%" />
  <img src="assets/chat_websocket.png" alt="Chat" width="30%" />
</p>

---

## Main Features

- **User Roles & Access Control**  
  Supports CUSTOMER, EMPLOYEE, and ADMIN roles with different permissions for shopping, order handling, and system management.

- **Product Browsing & Ordering**  
  Customers can browse products, view details, place orders, and track order status through the client interface.

- **Order & Inventory Management**  
  Admin and employees manage orders, update statuses, and adjust inventory data through the dashboard.

- **Payment & Shipping Integration**  
  Online payment is handled via **PayOS**, while shipping fee calculation and shipment creation are integrated with **GHN**.

- **Return & Refund Handling**  
  Customers can submit return requests, which are reviewed and processed by admins, with inventory updates applied accordingly.

- **Real-time Customer Support**  
  A built-in chat feature allows customers to communicate directly with admin or staff using WebSocket-based real-time messaging.

- **Product Recommendation (Basic)**  
  The system suggests related products based on user viewing behavior and product similarity.

---

## Technology Used

| Client / UI | Backend | Other Services |
|-------------|--------|------------|
| React (Client & Admin) | Spring Boot | MySQL |
| Ant Design / Tailwind CSS | Spring Data JPA | PayOS (Payment) |
| Axios | Spring Security (JWT) | GHN (Shipping) |
| WebSocket | FastAPI | Flyway |
|  |  | Swagger / Postman |

---

## Installation

### Required:
- JDK version ≥ 17  
- MySQL version ≥ 8.0  
- Maven version ≥ 3.8  
- Node.js ≥ 18 
- Python ≥ 3.10
