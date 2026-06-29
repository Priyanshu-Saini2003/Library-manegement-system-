# Library Management System - Project Report

## 1. Project Introduction

The Library Management System is a web-based application designed to manage the daily operations of a school, college, or university library. The system allows students to search books, check availability, request books, and track their issued books. It also allows librarians to manage books, issue and return books, view student records, and monitor library reports.

The frontend of the project is built using React and TypeScript. The backend is built using Java Spring Boot and is connected to a MySQL database. Swagger is used for API documentation and backend API testing.

## 2. Project Objective

The main objective of this project is to reduce manual library work and provide a digital system for managing library operations.

Key objectives:

- Maintain a digital catalog of books.
- Provide role-based login for students and librarians.
- Manage book issue and return operations.
- Track available copies, issued books, overdue books, and student activity.
- Connect the frontend with a Java REST API backend and MySQL database.

## 3. Technologies Used

Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React Icons

Backend:

- Java 17
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Security
- JWT Authentication
- Swagger / OpenAPI

Database:

- MySQL

Tools:

- Maven
- npm
- Swagger UI
- VS Code

## 4. User Roles

The system has two main user roles: Student and Librarian.

### Student

A student can:

- Register and log in to the system.
- View the student dashboard.
- Search and filter books.
- View book details.
- Request or issue available books.
- View their own issued books.
- View book recommendations.
- Read notifications.

### Librarian

A librarian can:

- Log in to the librarian dashboard.
- Add new books.
- Update existing books.
- Delete books.
- Issue books to students.
- Mark books as returned.
- View the student list.
- View reports and statistics.
- View notifications.

## 5. Main Features

### 5.1 Authentication

The system uses JWT-based authentication. After login or registration, the backend returns a token. The frontend stores this token in localStorage and sends it with protected API requests using the `Authorization: Bearer <token>` header.

Main authentication APIs:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### 5.2 Book Catalog

The book catalog displays all books available in the library. Users can search and filter books by title, author, category, and availability.

Book information includes:

- Book title
- Author
- ISBN
- Category
- Description
- Cover image
- Total copies
- Available copies
- Popularity score

Main book APIs:

- `GET /api/books`
- `GET /api/books/trending`
- `GET /api/books/{id}`
- `POST /api/books`
- `PUT /api/books/{id}`
- `DELETE /api/books/{id}`

### 5.3 Issue and Return Management

The system allows students to request books and librarians to manage book issue and return records. Each issue record stores the book, student, issue date, due date, return date, and current status.

Main issue APIs:

- `GET /api/issues`
- `GET /api/issues/my`
- `POST /api/issues`
- `PUT /api/issues/{id}/return`

### 5.4 Book Recommendations

The recommendation module displays suggested books for students. The current recommendation logic is based on backend rules such as book popularity, category, and availability.

Main recommendation API:

- `GET /api/recommendations`

### 5.5 Reports

The reports module helps librarians view library statistics and performance data.

Reports include:

- Total books
- Available books
- Issued books
- Overdue books
- Active students
- Popularity score
- Monthly issue trends
- Category-wise statistics

Main report APIs:

- `GET /api/reports`
- `GET /api/reports/summary`
- `GET /api/reports/monthly-issues`
- `GET /api/reports/category-stats`

### 5.6 Notifications

The notification system shows important messages to users. Users can mark notifications as read.

Main notification APIs:

- `GET /api/notifications`
- `PUT /api/notifications/read-all`

## 6. Project Architecture

The project follows a separated frontend and backend architecture.

Application flow:

1. The user opens the React frontend in the browser.
2. The frontend calls backend APIs through `src/lib/api.ts`.
3. The Spring Boot backend receives requests in controller classes.
4. The service layer handles business logic.
5. The repository layer reads and writes data using MySQL.
6. The backend sends JSON responses to the frontend.
7. The frontend updates the user interface based on the response.

Basic architecture:

```text
React Frontend -> REST API -> Spring Boot Backend -> JPA Repository -> MySQL Database
```

## 7. Frontend Structure

Important frontend folders:

- `src/components`: Reusable UI components such as buttons, modals, badges, and inputs.
- `src/context`: Global state and authentication context.
- `src/lib`: API helper file.
- `src/pages`: Main application pages.
- `src/data`: Old or mock data reference.
- `src/types.ts`: TypeScript interfaces for Profile, Book, BookIssue, and Notification.

Important frontend files:

- `src/lib/api.ts`: Handles backend API calls.
- `src/context/AuthContext.tsx`: Manages login, registration, logout, token, and current user.
- `src/context/AppContext.tsx`: Manages frontend navigation and layout state.
- `src/pages/BookCatalog.tsx`: Displays books, search, filters, and borrow requests.
- `src/pages/LibrarianDashboard.tsx`: Handles librarian book and issue management.
- `src/pages/IssueReturnPage.tsx`: Handles issue and return workflow.
- `src/pages/StudentDashboard.tsx`: Displays student dashboard data.
- `src/pages/AIRecommendations.tsx`: Displays recommended books.
- `src/pages/ReportsPage.tsx`: Displays reports and analytics.

## 8. Backend Structure

The backend is a Spring Boot project located inside the `backend` folder.

Important backend folders:

- `controller`: REST API endpoints.
- `service`: Business logic.
- `repository`: Database access using JPA.
- `model`: Entity classes and database table mapping.
- `dto`: Request and response DTOs.
- `mapper`: Entity-to-DTO conversion.
- `security`: JWT authentication and security configuration.
- `config`: Seeder and configuration classes.
- `exception`: Error handling.

Important backend files:

- `LibraryBackendApplication.java`: Main Spring Boot application file.
- `AuthController.java`: Login and registration APIs.
- `BookController.java`: Book APIs.
- `IssueController.java`: Issue and return APIs.
- `StudentController.java`: Student APIs.
- `ReportController.java`: Report APIs.
- `RecommendationController.java`: Recommendation APIs.
- `NotificationController.java`: Notification APIs.
- `application.properties`: MySQL, server port, JWT, and Swagger configuration.

## 9. Database Design

Database name:

```text
library_management
```

Main tables:

### profiles

Stores user information:

- id
- full_name
- email
- password_hash
- role
- student_id
- avatar_url
- created_at
- updated_at

### books

Stores book information:

- id
- title
- author
- isbn
- category
- description
- cover_url
- total_copies
- available_copies
- published_year
- publisher
- popularity_score
- created_at
- updated_at

### book_issues

Stores book issue and return records:

- id
- book_id
- student_id
- issued_by
- issue_date
- due_date
- return_date
- status
- notes
- created_at
- updated_at

### notifications

Stores user notifications:

- id
- profile_id
- message
- type
- is_read
- created_at

## 10. Backend and Database Connection

The backend connects to MySQL through the `backend/src/main/resources/application.properties` file.

Example configuration:

```properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/library_management?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_mysql_password
spring.jpa.hibernate.ddl-auto=update
```

Note: `ddl-auto=update` is useful for development because it normally keeps existing data. For production, proper database migration tools should be used.

## 11. Swagger Documentation

Swagger is used to test and document backend APIs in the browser.

Swagger URL:

```text
http://localhost:8080/swagger-ui.html
```

OpenAPI JSON URL:

```text
http://localhost:8080/v3/api-docs
```

## 12. Local Setup Steps

### Step 1: MySQL Setup

1. Install and start MySQL.
2. Keep the MySQL username and password ready.
3. Create the database manually, or let the backend create it using `createDatabaseIfNotExist=true`.

Optional SQL:

```sql
CREATE DATABASE library_management;
```

### Step 2: Backend Setup

Go to the backend folder:

```powershell
cd C:\Users\Dell\Documents\Codex\2026-05-20\hi\Book-manegement-main\Book-manegement-main\backend
```

Run the backend:

```powershell
..\.tools\apache-maven-3.9.9\bin\mvn.cmd spring-boot:run
```

If the relative path gives an issue, run this command from the project root:

```powershell
cd C:\Users\Dell\Documents\Codex\2026-05-20\hi\Book-manegement-main\Book-manegement-main
.\.tools\apache-maven-3.9.9\bin\mvn.cmd -f backend\pom.xml spring-boot:run
```

Backend URL:

```text
http://localhost:8080
```

### Step 3: Frontend Setup

Go to the project root:

```powershell
cd C:\Users\Dell\Documents\Codex\2026-05-20\hi\Book-manegement-main\Book-manegement-main
```

Install dependencies:

```powershell
npm install
```

Run the frontend:

```powershell
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

### Step 4: Environment File

The frontend `.env` file should contain the backend API base URL:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## 13. Testing Summary

The following checks were performed:

- Frontend TypeScript typecheck passed.
- Frontend production build passed.
- Backend Maven test/build passed.
- Swagger API documentation responded successfully.
- Librarian login API worked.
- Student login API worked.
- Books API returned seeded books.
- Students API worked.
- Reports summary API worked.
- Student issues and recommendations APIs worked.

## 14. Sample Demo Accounts

Seed/demo users:

```text
Student:
Email: alex@university.edu
Password: password123

Librarian:
Email: librarian@university.edu
Password: password123
```

## 15. Advantages

- Reduces manual library record work.
- Tracks book availability in real time.
- Provides separate dashboards for students and librarians.
- Uses JWT-based secure authentication.
- Uses REST API architecture, which can also support a future mobile app.
- Provides Swagger documentation for easy backend API testing.

## 16. Limitations

- Recommendations are currently based on basic backend rules.
- Fine calculation for overdue books is not fully implemented.
- Email notification support is not added yet.
- Production deployment configuration is not included.
- Advanced audit logs and backup features can be added in the future.

## 17. Future Enhancements

- Fine calculation for overdue books.
- Email/SMS notifications.
- Barcode or QR-based book issue system.
- Admin panel with advanced analytics.
- Book reservation and waitlist system.
- Export reports as PDF or Excel.
- Cloud deployment.
- Real AI recommendation model integration.

## 18. Conclusion

The Library Management System is a full-stack project that manages library operations using a React frontend, Java Spring Boot backend, and MySQL database. It includes authentication, role-based dashboards, book catalog, issue-return management, reports, notifications, and recommendations. The project can run locally and the backend APIs can be tested through Swagger.
