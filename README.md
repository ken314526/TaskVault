# TaskVault

TaskVault is a robust task management platform built with React and Node.js, designed to streamline your workflow and enhance productivity. Whether you're managing personal tasks or team projects, TaskVault provides the tools you need to stay organized and on track.

## Features

- **Modern User Interface**: A sleek and intuitive interface built with React for a seamless user experience.
- **Powerful Backend**: Built on Node.js for fast, scalable, and reliable performance.
- **Secure Authentication**: Secure login and session management to protect your data.
- **Task Management**: Create, update, delete, and organize tasks with ease.
- **Project Organization**: Group related tasks into projects for better management.
- **Real-time Updates**: See changes instantly across your devices.

## Tech Stack

### Frontend
- **React**: A JavaScript library for building user interfaces.
- **Other Libraries**: Redux, TailwindCSS.

### Backend
- **Node.js**: A JavaScript runtime built for scalable network applications.
- **Other Libraries**: Express.js, MongoDB, DotENV.

## Getting Started

### Prerequisites
Before you begin, ensure you have the following installed:
- Node.js
- MongoDB
- Git

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/ken314526/TaskVault.git
    cd TaskVault
    ```

2.  **Install Backend Dependencies**:
    Navigate to the backend directory and install dependencies:
    ```bash
    cd backend
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the `backend` directory based on the `.env.example` file:
    ```bash
    cp .env.example .env
    ```
    Update the values in `.env` with your specific configuration (database credentials, API keys, etc.).

4.  **Install Frontend Dependencies**:
    Navigate to the frontend directory and install dependencies:
    ```bash
    cd frontend
    npm install
    ```

5.  **Configure Frontend Environment Variables**:
    Create a `.env` file in the `frontend` directory based on the `.env.example` file:
    ```bash
    cp .env.example .env
    ```
    Update the values in `.env` with your specific configuration.

## Running the Application

### Development Mode

1.  **Start the Backend**:
    Open a terminal, navigate to the `backend` directory, and run:
    ```bash
    cd backend
    npm run dev
    ```
    The backend server will start on `http://localhost:5000` (or the port defined in your .env).

2.  **Start the Frontend**:
    Open a new terminal, navigate to the `frontend` directory, and run:
    ```bash
    cd frontend
    npm run dev
    ```
    The frontend application will start on `http://localhost:3000` (or the port defined in your .env).


## Developer Details

- Abhishek Sharma