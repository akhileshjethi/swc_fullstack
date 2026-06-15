# Spring Boot Authentication Service

This is a production-ready, secure Authentication Service built with Spring Boot 3, Spring Security 6, JWT, and PostgreSQL. It demonstrates user registration, login, and Role-Based Access Control (RBAC) to secure endpoints.

---

## Technology Stack

* **Java 17** (OpenJDK Temurin)
* **Spring Boot 3.3.0**
* **Spring Security 6** (Method Security enabled)
* **Spring Data JPA**
* **PostgreSQL**
* **JJWT 0.12.5** (JSON Web Tokens)
* **Lombok**
* **Jakarta Bean Validation**

---

## Directory & Package Structure

```text
auth-service/
├── src/main/java/com/assignment/auth/
│   ├── config/
│   │   └── SecurityConfig.java              # Security settings & Filter registers
│   ├── controller/
│   │   ├── AuthController.java              # Login & Registration Endpoints
│   │   ├── UserController.java              # Protected /user Endpoint
│   │   ├── TheatreController.java           # Protected /theatre Endpoint
│   │   └── AdminController.java             # Protected /admin Endpoint
│   ├── service/
│   │   ├── AuthService.java                 # Service Interface
│   │   ├── CustomUserDetailsService.java    # Loads details for Security
│   │   └── impl/
│   │       └── AuthServiceImpl.java         # Registration & Login Service logic
│   ├── repository/
│   │   └── UserRepository.java              # JpaRepository for DB access
│   ├── entity/
│   │   ├── User.java                        # User database entity
│   │   └── Role.java                        # Enum USER/THEATRE_OWNER/ADMIN
│   ├── dto/
│   │   ├── RegisterRequest.java             # Registration validation payload
│   │   ├── LoginRequest.java                # Login validation payload
│   │   ├── AuthResponse.java                # JWT & User details response
│   │   └── ErrorResponse.java               # Standardized Error Response
│   ├── security/
│   │   ├── UserPrincipal.java               # UserDetails adapter
│   │   ├── JwtTokenProvider.java            # JWT creator & parser
│   │   └── JwtAuthenticationFilter.java     # Request interceptor for validation
│   ├── exception/
│   │   ├── UserAlreadyExistsException.java  # Custom 409 Conflict
│   │   ├── InvalidCredentialsException.java # Custom 401 Unauthorized
│   │   ├── ResourceNotFoundException.java   # Custom 404 Not Found
│   │   └── GlobalExceptionHandler.java      # Handles errors and maps to JSON
│   └── AuthServiceApplication.java          # Boot Application Launcher
└── src/main/resources/
    └── application.properties               # DB configurations and JWT secret
```

---

## Configuration & Database Setup

Before running the application, ensure you have a PostgreSQL database named `auth_db` running on your local machine.

### `src/main/resources/application.properties`

```properties
# PostgreSQL Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/auth_db
spring.datasource.username=postgres
spring.datasource.password=your_db_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA and Hibernate Properties
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Server Configuration
server.port=8080

# JWT Configuration Properties
# Base64 encoded: "superSecretKeyForSpringSecurityAuthenticationServiceAssignment2"
app.jwt.secret=c3VwZXJTZWNyZXRLZXlGb3JTcHJpbmdTZWN1cml0eUF1dGhlbnRpY2F0aW9uU2VydmljZUFzc2lnbm1lbnQy
app.jwt.expiration-milliseconds=86400000
```

---

## How to Build and Run

Since Maven is embedded in the project via a Maven Wrapper, you can compile and boot it up using Java:

### 1. Build Project
```bash
# In the auth-service directory
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"; java "-Dmaven.multiModuleProjectDirectory=." -classpath .mvn/wrapper/maven-wrapper.jar org.apache.maven.wrapper.MavenWrapperMain clean package
```

### 2. Run Application
```bash
# Run the generated jar package
java -jar target/auth-service-0.0.1-SNAPSHOT.jar
```

---

## Postman API Documentation & Testing Examples

### 1. User Registration

* **Endpoint**: `POST http://localhost:8080/auth/register`
* **Headers**: `Content-Type: application/json`
* **Request Body (USER Role)**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword123",
    "role": "USER"
  }
  ```
* **Request Body (THEATRE_OWNER Role)**:
  ```json
  {
    "name": "Theatre Master",
    "email": "owner@example.com",
    "password": "securepassword123",
    "role": "THEATRE_OWNER"
  }
  ```
* **Request Body (ADMIN Role)**:
  ```json
  {
    "name": "Admin Chief",
    "email": "admin@example.com",
    "password": "securepassword123",
    "role": "ADMIN"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "message": "User registered successfully"
  }
  ```
* **Error Response (409 Conflict - Duplicate Email)**:
  ```json
  {
    "timestamp": "2026-06-15T21:40:00",
    "status": 409,
    "message": "Registration Conflict",
    "errors": [
      "Email is already registered: jane@example.com"
    ]
  }
  ```
* **Error Response (400 Bad Request - Validation Failures)**:
  ```json
  {
    "timestamp": "2026-06-15T21:40:12",
    "status": 400,
    "message": "Validation Failed",
    "errors": [
      "Email must be a valid email format",
      "Password must be at least 8 characters long"
    ]
  }
  ```

---

### 2. User Login

* **Endpoint**: `POST http://localhost:8080/auth/login`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqYW5lQGV4YW1wbGUuY29tIiwicm9sZSI6IlVTRVIiLCJuYW1lIjoiSmFuZSBEb2UiLCJpYXQiOjE3NTMwNDMyMDAsImV4cCI6MTc1MzEyOTYwMH0.signature...",
    "email": "jane@example.com",
    "role": "USER"
  }
  ```
* **Error Response (401 Unauthorized - Invalid Credentials)**:
  ```json
  {
    "timestamp": "2026-06-15T21:42:00",
    "status": 401,
    "message": "Authentication Failed",
    "errors": [
      "Invalid email or password"
    ]
  }
  ```

---

### 3. Protected Endpoint Testing (RBAC Check)

For all protected requests below, you must pass the generated JWT token in the **Headers** as a Bearer token:
`Authorization: Bearer <your_jwt_token_here>`

#### A. User Endpoint
* **Endpoint**: `GET http://localhost:8080/user/profile`
* **Access Level**: Only users with the role `USER`.
* **Authorized Response (200 OK)**:
  ```json
  {
    "message": "Welcome to the User Profile page! Access granted for role USER."
  }
  ```
* **Forbidden Response (403 Forbidden - when accessed using ADMIN or THEATRE_OWNER token)**:
  ```json
  {
    "timestamp": "2026-06-15T21:45:10",
    "status": 403,
    "message": "Access Denied",
    "errors": [
      "You do not have permission to access this resource"
    ]
  }
  ```

#### B. Theatre Endpoint
* **Endpoint**: `GET http://localhost:8080/theatre/dashboard`
* **Access Level**: Only users with the role `THEATRE_OWNER`.
* **Authorized Response (200 OK)**:
  ```json
  {
    "message": "Welcome to the Theatre Owner Dashboard! Access granted for role THEATRE_OWNER."
  }
  ```

#### C. Admin Endpoint
* **Endpoint**: `GET http://localhost:8080/admin/users`
* **Access Level**: Only users with the role `ADMIN`.
* **Authorized Response (200 OK)**:
  ```json
  {
    "message": "Welcome to the Admin user management board! Access granted for role ADMIN."
  }
  ```
