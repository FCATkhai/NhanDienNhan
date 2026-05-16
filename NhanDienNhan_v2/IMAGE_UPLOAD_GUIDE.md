# Image Upload & OpenAI Integration

## Overview
This is a complete setup for uploading images from the frontend to the backend, processing them with OpenAI's vision capabilities, and returning the results.

## Backend Setup

### Installation
```bash
npm install multer
npm install -D @types/multer
```

### Files Created

#### 1. `src/utils/imageProcessor.ts`
- Handles the OpenAI API integration
- Converts image buffers to base64
- Sends images to OpenAI's vision model
- Uses the custom wokushop API endpoint

#### 2. `src/routes/imageRoutes.ts`
- Express router with two main endpoints:
  - `POST /api/image/analyze` - Single image analysis
  - `POST /api/image/analyze-multiple` - Multiple images analysis (up to 10)
- Validates image files using multer
- Limits file size to 10MB

#### 3. Updated `src/app.ts`
- Registers image routes
- Added health check endpoint (`GET /health`)

### Backend Endpoints

#### Single Image Analysis
**Endpoint:** `POST http://localhost:5000/api/image/analyze`

**Request:**
```
Content-Type: multipart/form-data

Fields:
- image (File): The image file to analyze
- prompt (String, optional): Custom prompt (defaults to "what's in this image?")
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Analysis result from OpenAI...",
    "fileName": "image.jpg",
    "mimeType": "image/jpeg"
  }
}
```

#### Multiple Images Analysis
**Endpoint:** `POST http://localhost:5000/api/image/analyze-multiple`

**Request:**
```
Content-Type: multipart/form-data

Fields:
- images (File[]): Multiple image files (max 10)
- prompt (String, optional): Custom prompt
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "index": 0,
        "response": "Analysis result 1...",
        "fileName": "image1.jpg"
      },
      {
        "index": 1,
        "response": "Analysis result 2...",
        "fileName": "image2.jpg"
      }
    ],
    "totalImages": 2
  }
}
```

## Frontend Setup

### File Created
`src/apis/imageApi.ts` - Contains two utility functions:
- `uploadImageForAnalysis(file, prompt)` - Upload single image
- `uploadMultipleImagesForAnalysis(files, prompt)` - Upload multiple images

### Usage Example

```tsx
import { uploadImageForAnalysis } from '@/apis/imageApi';

function ImageUploadComponent() {
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await uploadImageForAnalysis(file, "Describe this image in detail");
    
    if (result.success) {
      console.log("Analysis:", result.data?.response);
      console.log("File:", result.data?.fileName);
    } else {
      console.error("Error:", result.error);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
      />
    </div>
  );
}
```

### Multiple Images Example

```tsx
import { uploadMultipleImagesForAnalysis } from '@/apis/imageApi';

function MultipleImagesComponent() {
  const handleMultipleImages = async (files: File[]) => {
    const result = await uploadMultipleImagesForAnalysis(
      files,
      "Analyze each image"
    );
    
    if (result.success) {
      result.data?.results.forEach((item) => {
        console.log(`${item.fileName}:`, item.response);
      });
    } else {
      console.error("Error:", result.error);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          handleMultipleImages(files);
        }}
      />
    </div>
  );
}
```

## Configuration

### Environment Variables
Make sure your `.env` file in the backend root has:
```
wokushop_api_key=your_api_key_here
PORT=5000
```

For the frontend, configure the API URL in `.env`:
```
VITE_API_URL=http://localhost:5000
```

## Supported Image Formats
- JPEG (image/jpeg)
- PNG (image/png)
- GIF (image/gif)
- WebP (image/webp)

## Limits
- File size: 10MB per image
- Multiple upload: Max 10 images at once
- Timeout: Standard HTTP request timeout

## Error Handling

The endpoints return error responses with status codes:
- `400` - Bad request (no file, invalid format)
- `500` - Server error (OpenAI API failure, processing error)

Example error response:
```json
{
  "success": false,
  "error": "Only image files are allowed"
}
```

## Testing with cURL

### Single Image
```bash
curl -X POST http://localhost:5000/api/image/analyze \
  -F "image=@/path/to/image.jpg" \
  -F "prompt=What objects are in this image?"
```

### Multiple Images
```bash
curl -X POST http://localhost:5000/api/image/analyze-multiple \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "prompt=Describe each image"
```

## Architecture Flow

```
Frontend (React)
    ↓
    ├─ Select image(s)
    └─ uploadImageForAnalysis() / uploadMultipleImagesForAnalysis()
            ↓
    HTTP POST multipart/form-data
            ↓
Backend Express Server
    ├─ /api/image/analyze
    ├─ /api/image/analyze-multiple
    ↓
Multer (File handling)
    ├─ Validates file type
    ├─ Limits file size
    └─ Stores in memory
            ↓
imageProcessor.ts
    ├─ Converts to base64
    └─ Calls OpenAI API
            ↓
OpenAI Vision Model
    ├─ Analyzes image
    └─ Returns response
            ↓
Backend Response → Frontend
    ↓
Display result to user
```
