# Catalog Service - Movie Ticket Booking Platform

Catalog Service manages movies, locations, theatres, auditoriums (screens), and seat layouts.

## Directory Structure

```
catalog-service/
├── pom.xml
├── README.md
└── src/
    └── main/
        ├── java/
        │   └── com/
        │       └── assignment/
        │           └── catalog/
        │               ├── CatalogServiceApplication.java
        │               ├── config/
        │               │   ├── SecurityConfig.java
        │               │   └── (MongoDB setup uses auto-configuration)
        │               ├── controller/
        │               │   ├── AuditoriumController.java
        │               │   ├── LocationController.java
        │               │   ├── MovieController.java
        │               │   └── TheatreController.java
        │               ├── dto/
        │               │   ├── AuditoriumDTO.java
        │               │   ├── LocationDTO.java
        │               │   ├── MovieDTO.java
        │               │   ├── SeatDTO.java
        │               │   └── TheatreDTO.java
        │               ├── entity/
        │               │   ├── Auditorium.java
        │               │   ├── Location.java
        │               │   ├── Movie.java
        │               │   ├── Seat.java
        │               │   └── Theatre.java
        │               ├── exception/
        │               │   ├── BadRequestException.java
        │               │   ├── GlobalExceptionHandler.java
        │               │   └── ResourceNotFoundException.java
        │               ├── mapper/
        │               │   └── CatalogMapper.java
        │               ├── repository/
        │               │   ├── AuditoriumRepository.java
        │               │   ├── LocationRepository.java
        │               │   ├── MovieRepository.java
        │               │   └── TheatreRepository.java
        │               ├── response/
        │               │   └── ApiResponse.java
        │               ├── security/
        │               │   └── JwtAuthenticationFilter.java
        │               └── service/
        │                   ├── AuditoriumService.java
        │                   ├── LocationService.java
        │                   ├── MovieService.java
        │                   ├── TheatreService.java
        │                   └── impl/
        │                       ├── AuditoriumServiceImpl.java
        │                       ├── LocationServiceImpl.java
        │                       ├── MovieServiceImpl.java
        │                       └── TheatreServiceImpl.java
        └── resources/
            └── application.yml
```

---

## Sample MongoDB Documents

### 1. Movie (`movies` Collection)

```json
{
  "_id": "648a735bb9910c2c10b7ee01",
  "title": "Avengers: Endgame",
  "genre": "Action",
  "language": "English",
  "duration": 181,
  "rating": 8.4,
  "releaseDate": "2019-04-26",
  "description": "After the devastating events of Avengers: Infinity War, the universe is in ruins...",
  "posterUrl": "https://example.com/posters/avengers-endgame.jpg",
  "_class": "com.assignment.catalog.entity.Movie"
}
```

### 2. Location (`locations` Collection)

```json
{
  "_id": "648a735bb9910c2c10b7ee02",
  "city": "Delhi",
  "state": "Delhi",
  "country": "India",
  "_class": "com.assignment.catalog.entity.Location"
}
```

### 3. Theatre (`theatres` Collection)

```json
{
  "_id": "648a735bb9910c2c10b7ee03",
  "theatreName": "PVR Director's Cut",
  "address": "Ambience Mall, Vasant Kunj",
  "locationId": "648a735bb9910c2c10b7ee02",
  "ownerId": "owner_12345",
  "_class": "com.assignment.catalog.entity.Theatre"
}
```

### 4. Auditorium (`auditoriums` Collection)

```json
{
  "_id": "648a735bb9910c2c10b7ee04",
  "screenName": "Audi 1",
  "theatreId": "648a735bb9910c2c10b7ee03",
  "totalSeats": 3,
  "seatLayout": [
    {
      "seatNumber": "A1",
      "rowNumber": "A",
      "seatType": "PREMIUM",
      "priceMultiplier": 1.5
    },
    {
      "seatNumber": "A2",
      "rowNumber": "A",
      "seatType": "PREMIUM",
      "priceMultiplier": 1.5
    },
    {
      "seatNumber": "B1",
      "rowNumber": "B",
      "seatType": "NORMAL",
      "priceMultiplier": 1.0
    }
  ],
  "_class": "com.assignment.catalog.entity.Auditorium"
}
```

---

## Postman API Collection Examples

All request headers must include:
`Authorization: Bearer <JWT_TOKEN>`

### 1. Create Location
* **Method**: `POST`
* **URL**: `http://localhost:8082/locations`
* **Body**:
```json
{
  "city": "Delhi",
  "state": "Delhi",
  "country": "India"
}
```

### 2. Create Theatre
* **Method**: `POST`
* **URL**: `http://localhost:8082/theatres`
* **Body**:
```json
{
  "theatreName": "PVR Director's Cut",
  "address": "Ambience Mall, Vasant Kunj",
  "locationId": "648a735bb9910c2c10b7ee02",
  "ownerId": "owner_123"
}
```

### 3. Create Movie
* **Method**: `POST`
* **URL**: `http://localhost:8082/movies`
* **Body**:
```json
{
  "title": "Avengers: Endgame",
  "genre": "Action",
  "language": "English",
  "duration": 181,
  "rating": 8.4,
  "releaseDate": "2019-04-26",
  "description": "After the devastating events of Avengers: Infinity War...",
  "posterUrl": "https://example.com/posters/avengers-endgame.jpg"
}
```

### 4. Create Auditorium
* **Method**: `POST`
* **URL**: `http://localhost:8082/auditoriums`
* **Body**:
```json
{
  "screenName": "Audi 1",
  "theatreId": "648a735bb9910c2c10b7ee03",
  "totalSeats": 3,
  "seatLayout": [
    {
      "seatNumber": "A1",
      "rowNumber": "A",
      "seatType": "PREMIUM",
      "priceMultiplier": 1.5
    },
    {
      "seatNumber": "A2",
      "rowNumber": "A",
      "seatType": "PREMIUM",
      "priceMultiplier": 1.5
    },
    {
      "seatNumber": "B1",
      "rowNumber": "B",
      "seatType": "NORMAL",
      "priceMultiplier": 1.0
    }
  ]
}
```

### 5. Sort Movies by Rating
* **Method**: `GET`
* **URL**: `http://localhost:8082/movies?page=0&size=10&sortBy=rating&direction=desc`

### 6. Combined Search Movie
* **Method**: `GET`
* **URL**: `http://localhost:8082/movies/search?title=Avengers&genre=Action`
