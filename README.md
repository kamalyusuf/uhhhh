# Uhhhh

## App Demo

https://github.com/user-attachments/assets/d01e5943-916b-4e13-9262-38f845a6f5f5

The project includes:

- `apps/api`: Express Backend API.
- `apps/web`: Next Frontend.

## Features

- Create and join audio chat rooms
- Live text chat within each room
- Mute/unmute your own microphone
- Ability to mute other participants' microphones

## Tech Stack

### Backend

- [Express](https://github.com/expressjs/express)
- [Socket.io](https://github.com/socketio/socket.io)
- [MediaSoup](https://github.com/versatica/mediasoup)

### Frontend

- [React](https://github.com/facebook/react)
- [Next.js](https://github.com/vercel/next.js)
- [Mantine](https://github.com/mantinedev/mantine)
- [Socket.io-client](https://github.com/socketio/socket.io)
- [MediaSoup Client](https://github.com/versatica/mediasoup-client)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Query](https://github.com/TanStack/query)

## Prerequisites

- Node.js installed (supports Corepack).
- Yarn (enabled through Corepack).
- Follow [mediasoup installation steps](https://mediasoup.org/documentation/v3/mediasoup/installation/) for required dependencies (e.g., Python).
- Docker (optional for API).

## Running Locally

### 1. Clone the Repository

```bash
git clone https://github.com/kamalyusuf/uhhhh.git
cd uhhhh
```

### 2. Enable Corepack

```bash
corepack enable
```

### Option 1: Local Development

#### 1. Install Dependencies

```bash
yarn install
```

#### 2. Set Environment Variables (optional)

- Update values as needed:
  - **API**: `NODE_ENV`, `PORT`, `WEB_URL`, `LISTEN_IP`, `ANNOUNCED_IP`, `MEDIASOUP_MIN_PORT`, `MEDIASOUP_MAX_PORT`.
    - Defaults: `NODE_ENV=development`, `PORT=2300`, `WEB_URL=http://localhost:3000`, `LISTEN_IP=0.0.0.0`, `ANNOUNCED_IP=127.0.0.1`, `MEDIASOUP_MIN_PORT=2000`, `MEDIASOUP_MAX_PORT=2020`.
  - **Web**: `NEXT_PUBLIC_API_URL`.
    - Defaults: `NEXT_PUBLIC_API_URL=http://localhost:2300`.

#### 3. Start the Applications

```bash
yarn dev
```

- API runs on `http://localhost:2300`.
- Web runs on `http://localhost:3000`.

### Option 2: Dockerized API

#### 1. Run the API with Docker

Run the `run.sh` script to start the API (port `2300` by default and on production mode):

```bash
bash run.sh
```

You can also use the provided `docker-compose.yaml` file to run the API. Simply execute:

```bash
docker-compose up
```

#### 2. Run the Web App Locally

Install dependencies for the web app only:

```bash
yarn workspaces focus web
```

Start the web app:

```bash
yarn workspace web dev
```

The web app will run on `http://localhost:3000`.
