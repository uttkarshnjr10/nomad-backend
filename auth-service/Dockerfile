# Stage 1: Build the application
FROM eclipse-temurin:17-jdk-alpine as builder
WORKDIR /app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
# Fix windows line endings in mvnw if present and make executable
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw
RUN ./mvnw dependency:go-offline
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]