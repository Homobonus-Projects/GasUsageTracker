# GasTrack AI 📉🔥

**GasTrack AI** is a smart utility tracking application designed to monitor gas consumption efficiently. It leverages **Google's Gemini AI** to automatically extract meter readings from photos, reducing manual entry errors and making tracking effortless.

Built with **React**, **TypeScript**, and **Vite**, this application offers a responsive dashboard to visualize usage trends, calculate daily averages, and manage historical data.

---

## ✨ Key Features

- **📸 AI-Powered OCR**: Simply take a photo of your gas meter, and the integrated Gemini AI will identify and extract the numbers for you.
- **📊 Interactive Dashboard**: View your consumption over time with dynamic charts powered by Recharts.
- **📉 Usage Analytics**: Automatically calculates daily average consumption and total usage between readings.
- **📱 Mobile-First Design**: Fully responsive interface that works perfectly on smartphones and desktops.
- **💾 Local Persistence**: Data is stored securely in your browser's local storage.
- **🐳 Containerized**: Fully Dockerized with CI/CD workflows ready for deployment.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini SDK (`@google/genai`)
- **Visualization**: Recharts
- **UI Components**: React Toastify, FontAwesome
- **DevOps**: Docker, GitHub Actions

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- A Google AI Studio API Key

### Local Development

1.  **Clone the repository**
    ```bash
    git clone <your-repo-url>
    cd Gastracker
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root directory:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

4.  **Run the application**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:3000`.

## 🐳 Docker Deployment

This project includes a production-ready `Dockerfile` and `docker-compose.yaml`.

### CI/CD Pipeline

The repository is configured with **GitHub Actions** to automate deployment:
1.  Pushes to the `dev` branch trigger the workflow.
2.  Builds the Docker image with the API key (stored in GitHub Secrets).
3.  Pushes the image to GitHub Container Registry (GHCR).
4.  Deploys to a self-hosted runner using Docker Compose on port `5003`.

## 📄 License

This project is licensed under the MIT License.
