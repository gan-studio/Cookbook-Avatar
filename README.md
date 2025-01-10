# Video Avatar Generator

A modern web application that leverages GAN.AI's API to create and manage video avatars.

## Features

- Upload videos to create avatars
- Check avatar processing status
- Generate video copies with custom text
- Monitor video copy generation status
- Real-time status updates

## Tech Stack

- React/Next.js
- Redux Toolkit Query
- TypeScript

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- GAN.AI API key

### Environment Setup

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_GANOS_API_KEY=your_api_key_here
```

Get your API key from [[https://playground.gan.ai](https://playground.gan.ai).

## Installation

```
npm install
```

## Running the Development Server

```
npm run dev
```

## Building for Production

```
npm run build
```

## API Integration

The application integrates with GAN.ai's Avatar API and provides the following endpoints:

- `create_avatar`: Upload a video to create an avatar
- `avatar_details`: Check avatar processing status
- `create_video`: Generate a video copy with custom text
- `inference_details`: Check video copy generation status

## Usage

1. Upload a video using the upload form
2. Wait for the avatar processing to complete
3. Generate video copies by providing custom text
4. Monitor the generation status
5. Download or view the generated video

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
