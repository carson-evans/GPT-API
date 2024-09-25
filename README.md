# GPT-4 Sentiment and Risk Analysis API

## Description

This project is a Node.js application that interacts with the OpenAI GPT-4 API to perform sentiment and self-harm risk analysis on user messages. It stores analysis results in MongoDB, manages user authentication, and sends email alerts when potential self-harm content is detected. The application provides a chat interface for users and can be deployed locally or to a cloud environment.

## Features

- **Self-Harm Risk Detection**: Utilizes OpenAI's Moderation API to detect self-harm content in user messages.
- **Email Notifications**: Sends email alerts to designated recipients when potential self-harm risk is detected.
- **MongoDB Integration**: Stores risk analysis results and user data in a MongoDB database using Mongoose.
- **Secure User Authentication**: Implements JWT for session management and bcrypt for password hashing.
- **Real-time Chat Interface**: Users can communicate with the AI in real-time through a web-based chat interface.
- **User Registration and Login**: Allows users to create accounts and securely log in before accessing the chat.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Email Notifications](#email-notifications)
- [Deployment](#deployment)
- [Security and Privacy Considerations](#security-and-privacy-considerations)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Installation

### Prerequisites

- **Node.js**: Ensure you have Node.js installed.
- **MongoDB Atlas Account**: Sign up for a free MongoDB Atlas account.
- **OpenAI API Key**: Obtain an API key from OpenAI.
- **Email Service Account**: Set up an account with an email service provider like SendGrid.
- **Git**: For cloning the repository.

### Steps

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/carson-evans/GPT-API.git
   ```

2. **Navigate to the Project Directory**:

   ```bash
   cd path/to/project-directory
   ```

3. **Install Dependencies**:

   ```bash
   npm install
   ```

4. **Set Up Environment Variables**:

   - Rename `sample_env.js` to `env.js` and update it with your actual keys and configurations.

     ```javascript
     // env.js
     export const process = {
       env: {
         OPENAI_API_KEY: "your-openai-api-key",
         MONGODB_URI: "your-mongodb-connection-uri",
         EMAIL_SERVICE_API_KEY: "your-email-service-api-key",
         ALERT_EMAIL_RECIPIENT: "alerts@example.com",
         JWT_SECRET: "your-jwt-secret-key",
       },
     };
     ```

   - **Note**: Ensure `env.js` is included in your `.gitignore` file to prevent sensitive information from being committed to version control.

## Configuration

### OpenAI API Key

- Obtain your API key from the [OpenAI dashboard](https://platform.openai.com/account/api-keys).
- Update the `OPENAI_API_KEY` in your `env.js`.

### MongoDB Setup

- Create a MongoDB Atlas cluster.
- Set up a database user and whitelist your IP address.
- Obtain your connection URI and update the `MONGODB_URI` in your `env.js`.

### Email Service Setup

- Create an account with SendGrid or another email service provider.
- Generate an API key and update the `EMAIL_SERVICE_API_KEY` in your `env.js`.
- Verify your sender identity as per your email service's instructions.
- Set the `ALERT_EMAIL_RECIPIENT` in your `env.js` to the email address where alerts should be sent.
- Set the `from: 'no-reply@yourdomain.com'` in `index.js` to the verified sender email.

### JWT Secret

- Generate a secure secret key for signing JWT tokens.
- Update the `JWT_SECRET` in your `env.js`.

## Running the Application

### Start the Server

   ```bash
   npm start
  ```

- The server will run at `http://localhost:3000`.

### Access the Application

- Open your browser and navigate to `http://localhost:3000`.
- Register a new account and log in to access the chat interface.

## API Endpoints

### **POST** `/register`

- Registers a new user.

#### Request Body

```json
{
  "username": "your-username",
  "password": "your-password"
}
```

#### Response

```json
{
  "message": "Registration successful"
}
```

### **POST** `/login`

- Authenticates a user and returns a JWT token.

#### Request Body

```json
{
  "username": "your-username",
  "password": "your-password"
}
```

#### Response

```json
{
  "message": "Login successful",
  "token": "your-jwt-token"
}
```

### **POST** ``

- Handles chat messages and performs risk analysis.

#### Headers

- **Authorization**: `Bearer your-jwt-token`

#### Request Body

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Your message here"
    }
  ]
}
```

#### Response

```json
{
  "response": "Assistant's response"
}
```

## Email Notifications

- When potential self-harm content is detected in a user's message, the application sends an email alert to the address specified in `ALERT_EMAIL_RECIPIENT`.
- **Email Content**:
  - **Subject**: `Urgent: Self-Harm Risk Detected for User ID [userId]`
  - **Body**: Includes the user's message and the self-harm score.

## Deployment

### Deploying to a Cloud Platform

- Ensure all environment variables are set securely in your hosting environment.
- Common platforms include Heroku, AWS Elastic Beanstalk, and Azure App Service.

### SSL and Security

- Use HTTPS to secure data in transit.
- Obtain SSL certificates through services like Let's Encrypt.

## Security and Privacy Considerations

- **User Consent**: Inform users that their messages are analyzed for safety purposes.
- **Data Protection**: Implement measures to protect user data, including encryption and secure storage practices.
- **Access Control**: Limit access to sensitive data and ensure only authorized personnel can view alerts.
- **Compliance**: Adhere to relevant laws and regulations, such as GDPR or HIPAA.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch:

  ```bash
   git checkout -b feature/your-feature-name
   ```

3. Commit your changes:

   ```bash
   git commit -m "Add your descriptive commit message"
   ```

4. Push to the branch:

   ```bash
   git push origin feature/your-feature-name
   ```

5. Open a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

- **OpenAI** for providing the GPT-4 and Moderation APIs.
- **MongoDB** for database solutions.
- **SendGrid** for email services.
