# Slido Clone

A fully-featured interactive audience engagement platform similar to Slido, allowing presenters to create polls, Q&A sessions, and word clouds for real-time audience interaction.

![Slido Clone Screenshot](https://i.imgur.com/placeholder.png)

## Features

- **Live Polls**: Create multiple-choice polls with real-time results
- **Q&A**: Allow participants to ask questions and vote on them
- **Word Cloud**: Generate visual representations of audience responses
- **Event Management**: Create, manage, and close events
- **Event History**: View past, active, and upcoming events
- **QR Codes**: Generate QR codes for events and polls
- **Timer**: Set timers for polls and word clouds
- **Mobile-Friendly**: Responsive design for all devices

## Demo

You can try the live demo at: [https://yourusername.github.io/slido-clone](https://yourusername.github.io/slido-clone)

## Local Development

### Prerequisites

- A modern web browser
- Basic knowledge of HTML, CSS, and JavaScript

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/slido-clone.git
   cd slido-clone
   ```

2. Start a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # OR using Node.js
   npx serve
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

## Deployment to GitHub Pages

### Automatic Deployment

This repository is set up with GitHub Actions to automatically deploy to GitHub Pages whenever changes are pushed to the main branch.

### Manual Deployment

1. Create a GitHub repository for your project.

2. Initialize Git in your project folder (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. Connect to your GitHub repository:
   ```bash
   git remote add origin https://github.com/yourusername/slido-clone.git
   git branch -M main
   git push -u origin main
   ```

4. Enable GitHub Pages in your repository settings:
   - Go to your repository on GitHub
   - Navigate to Settings > Pages
   - Select the `gh-pages` branch as the source
   - Save the settings

## Usage

### Creating an Event

1. Click "Sign up free" or "Log in" to access your account
2. Click "Create slido" button
3. Enter event details and click "Create slido"

### Joining an Event

1. Click "Join a Slido" on the homepage
2. Enter the event code and your name
3. Click "Join event"

### Creating a Poll

1. In the presenter dashboard, go to the "Polls" section
2. Click "Create poll"
3. Enter your question, options, and settings
4. Click "Create poll"

### Creating a Word Cloud

1. In the presenter dashboard, go to the "Word cloud" section
2. Click "Create word cloud"
3. Enter your question and settings
4. Click "Create word cloud"

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Inspired by [Slido](https://www.slido.com)
- Icons from [Heroicons](https://heroicons.com)
- QR code generation using [QRious](https://github.com/neocotic/qrious) 