# Library Backend

Java Spring Boot backend for the React library management app.

## Requirements

- Java 17+
- Maven
- MySQL running locally

## Configure MySQL

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.username=root
spring.datasource.password=your_mysql_password
app.jwt.secret=change_this_to_a_long_random_secret_key_at_least_32_chars
```

The database `library_management` is created automatically if the MySQL user has permission.

## Run

```bash
mvn spring-boot:run
```

Swagger:

```txt
http://localhost:8080/swagger-ui/index.html
```

## Demo Users

```txt
alex@university.edu / password123
librarian@university.edu / password123
```

## Frontend Env

```env
VITE_API_BASE_URL=http://localhost:8080/api
```
