# GPT-API-Azure Project

## Description
This project is a Node.js application interfacing with the OpenAI GPT-3.5 API to create a chat application. Users can send messages through a web interface, and the application sends these messages to the GPT-3.5 API to generate responses. The application is designed to be deployed as a serverless function on Microsoft Azure.

## Setup and Installation

### Prerequisites
- Node.js installed on your machine.
- An OpenAI API key. Set this key in your `env.js` file.
- Microsoft Azure account for deployment.

### Installation
1. Clone the repository to your local machine.
2. Navigate to the project directory and run `npm install` to install dependencies.

### Local Testing
1. Start the server by running `node index.js` in your terminal. The server will start on `localhost:3000`.
2. For the best experience, open the `index.html` file using the Visual Studio Code extension for Live Server (ritwickdey.LiveServer). This extension provides a live preview of your HTML files, automatically refreshing them as you make changes.
3. Alternatively, you can manually open the `index.html` file in your browser, but you won't have the live reload feature that the Live Server extension offers.

## Deployment to Azure
To deploy this application as a serverless function on Microsoft Azure, follow these steps:

1. Log in to your Azure portal.
2. Create a new Function App.
3. Follow the prompts to configure your Function App, selecting Node.js as your runtime stack.
4. Once your Function App is created, navigate to its overview page.
5. Use the provided deployment methods (such as Azure CLI, GitHub Actions, or directly from Visual Studio Code) to deploy your application.
6. Ensure that your environment variables, including your OpenAI API key, are correctly set in the Function App settings.

## Contributing
Contributions to this project are welcome. Please fork the repository and submit a pull request with your changes. Make sure to follow the project's code style and include appropriate tests.

## License
This project is licensed under the [MIT License](LICENSE). See the LICENSE file in the project repository for more details.

## Contact
For any questions or feedback regarding this project, please open an issue in the GitHub repository.

## Acknowledgments
- OpenAI for providing the GPT-3.5 API.
- Microsoft Azure for hosting and serverless services.
