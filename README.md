# GPT Sentiment Analysis and Monitoring API

## Description
This project is a Node.js application that interacts with the OpenAI GPT-4 API to perform sentiment analysis on user messages. It stores the analysis results in MongoDB, tracks user sessions, and sends email alerts when negative sentiment or potential risks are detected. The application provides a simple chat interface for users and can be deployed locally or to a cloud environment.

## Features
- **Sentiment Analysis**: Leverages the OpenAI GPT-4 API to analyze user messages for sentiment.
- **User Authentication**: Basic user login and session management.
- **MongoDB Integration**: Stores sentiment analysis results and user data in a MongoDB database.
- **Email Notifications**: Sends an email alert to designated recipients when negative sentiment or risky content is detected.
- **Real-time Chat Interface**: Users can communicate with the AI in real-time through a web-based chat interface.

## Setup and Installation

### Prerequisites
- Node.js installed on your machine.
- An OpenAI API key. Set this key in your `env.js` file.
- A MongoDB connection URI.
- Gmail or another SMTP service for email notifications.

### Installation
1. Clone the repository to your local machine:
```-bash
git clone https://github.com/carson-evans/GPT-API.git
```
2. Navigate to the project directory:
```bash
cd drive:\workspace\GPT-API
```
3. Install the dependencies:
```bash
npm install
```
4. Rename `sample_env.js` to `env.js` and configure the environment variables:
```javascript
export const process = {
   env: {
       OPENAI_API_KEY: "your-openai-api-key",
       MONGODB_URI: "your-mongodb-connection-uri",
       EMAIL_SERVICE_API_KEY: "your-email-service-api-key"
   }
};
```

### Running Locally
1. Start the server:
```bash
node ./src/index.js
```
2. Open the `index.html` file in a browser to access the chat interface.

### API Endpoints

- **POST `/login`**: Logs in a user and returns a session token.
  - **Request Body**:
    ```json
    {
      "username": "your-username",
      "password": "your-password"
    }
    ```
  - **Response**:
    ```json
    {
      "message": "Login successful",
      "sessionToken": "session_<user_id>"
    }
    ```

- **POST `/analyze-sentiment`**: Analyzes sentiment from the user’s message and saves the results to MongoDB. This requires a valid session token in the request headers.
  - **Request Body**:
    ```json
    {
      "text": "Your message here"
    }
    ```
  - **Response**:
    ```json
    {
      "message": "Sentiment analysis saved",
      "sentimentResult": "<Sentiment analysis result>"
    }
    ```

### Email Notifications
- The application sends an email to a designated counselor or monitoring team if negative sentiment or risky language is detected. You can configure the recipient email in the `sendAlertEmail` function in `index.js`.

### Deployment

#### Deploying to a Cloud Platform (e.g., Heroku, Azure, AWS)
1. Set the environment variables for `OPENAI_API_KEY`, `MONGODB_URI`, and `EMAIL_SERVICE_API_KEY` in the cloud platform's settings.
2. Push the repository to the cloud platform.

### Contributing
Contributions are welcome! Please fork the repository and create a pull request for any enhancements or bug fixes.

### License
This project is licensed under the [MIT License](LICENSE).

### Acknowledgments
- OpenAI for providing the GPT-4 API.
- MongoDB for cloud database storage.
- Nodemailer for sending email notifications.
