# Image Upload & OpenAI Integration

## Overview
This is a complete setup for uploading images from the frontend to the backend, processing them with OpenAI's vision capabilities, and returning the results.

## Backend Setup

### Installation
```bash
cd NhanDienNhan_v2/backend
npm install
```

### Files Created

#### 1. `src/utils/imageProcessor.ts`
- Handles the OpenAI API integration
- Converts image buffers to base64
- Sends images to OpenAI's vision model
- Uses the custom wokushop API endpoint

#### 2. `src/routes/imageRoutes.ts`
- Express router with a unified endpoint:
  - `POST /api/image/analyze` - Analyzes 1-10 images
    - If 1 image: uses `processImageWithOpenAI`
    - If 2-10 images: uses `processMultipleImagesWithOpenAI`
- Validates image files using multer
- Limits file size to 10MB per image

#### 3. Updated `src/app.ts`
- Registers image routes
- Added health check endpoint (`GET /health`)

### Backend Endpoints

#### Unified Image Analysis
**Endpoint:** `POST http://localhost:5000/api/image/analyze`

Accepts 1-10 images and automatically selects the appropriate processor.

**Request:**
```
Content-Type: multipart/form-data

Fields:
- images (File[]): Image files to analyze (1-10 files)
- prompt (String, optional): Custom prompt
```

**Response (Single Image):**
```json
{
  "success": true,
  "data": {
    "response": "{\"product_name\":\"Example Product\",\"manufacturer\":\"Example Mfg\",\"product_type\":\"Type\",\"active_ingredients\":[{\"name\":\"Ingredient 1\",\"content\":\"100g/kg\"}],\"target_crops\":[\"crop1\"],\"target_pests\":[\"pest1\"],\"dosage\":\"Usage info\",\"registration_number\":\"VN123456\",\"pre_harvest_interval_days\":7,\"expiry_date\":null,\"confidence_score\":0.95}",
    "fileName": "image.jpg",
    "mimeType": "image/jpeg",
    "totalImages": 1
  }
}
```

**Response (Multiple Images):**
```json
{
  "success": true,
  "data": {
    "response": "{\"product_name\":\"Example Product\",\"manufacturer\":\"Example Mfg\",\"product_type\":\"Type\",\"active_ingredients\":[{\"name\":\"Ingredient 1\",\"content\":\"100g/kg\"}],\"target_crops\":[\"crop1\"],\"target_pests\":[\"pest1\"],\"dosage\":\"Usage info\",\"registration_number\":\"VN123456\",\"pre_harvest_interval_days\":7,\"expiry_date\":null,\"confidence_score\":0.95}",
    "totalImages": 2
  }
}
```

**Note:** The `response` field contains product information as a JSON string that needs to be parsed on the client side.

## Frontend Setup

### File Created
`src/apis/imageApi.ts` - Contains utility functions for uploading images

### Usage Example (Single or Multiple Images)

```tsx
import { uploadImageForAnalysis } from '@/apis/imageApi';

function ImageUploadComponent() {
  const handleImageUpload = async (files: File[]) => {
    // Works with 1-10 images
    const result = await uploadImageForAnalysis(files, "Analyze this product");
    
    if (result.success) {
      // Parse the response string to get product info
      const productInfo = JSON.parse(result.data?.response);
      
      console.log("Product:", productInfo.product_name);
      console.log("Manufacturer:", productInfo.manufacturer);
      console.log("Confidence:", productInfo.confidence_score);
      console.log("Total images analyzed:", result.data?.totalImages);
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
          if (files.length > 0 && files.length <= 10) {
            handleImageUpload(files);
          }
        }}
      />
    </div>
  );
}
```

### Response Parsing Example

```tsx
function parseProductResponse(responseData: any) {
  const productInfo = JSON.parse(responseData.response);
  
  return {
    productName: productInfo.product_name,
    manufacturer: productInfo.manufacturer,
    type: productInfo.product_type,
    activeIngredients: productInfo.active_ingredients,
    targetCrops: productInfo.target_crops,
    targetPests: productInfo.target_pests,
    dosage: productInfo.dosage,
    registrationNumber: productInfo.registration_number,
    preHarvestInterval: productInfo.pre_harvest_interval_days,
    confidence: productInfo.confidence_score,
    totalImages: responseData.totalImages
  };
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
- Single request: 1-10 images
- Automatic processor selection based on image count
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
  -F "images=@/path/to/image.jpg" \
  -F "prompt=Analyze this product label"
```

### Multiple Images
```bash
curl -X POST http://localhost:5000/api/image/analyze \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "images=@/path/to/image3.jpg" \
  -F "prompt=Analyze these product labels"
```

## Architecture Flow

```
Frontend (React)
    ↓
    ├─ Select 1-10 image(s)
    └─ uploadImageForAnalysis(files, prompt)
            ↓
    HTTP POST multipart/form-data
            ↓
Backend Express Server
    └─ POST /api/image/analyze
            ↓
Multer (File handling)
    ├─ Validates file type
    ├─ Limits file size (10MB each)
    └─ Stores in memory
            ↓
imageRoutes.ts (Intelligent Routing)
    ├─ If 1 image:
    │   └─ Call processImageWithOpenAI()
    └─ If 2-10 images:
            └─ Call processMultipleImagesWithOpenAI()
            ↓
OpenAI Vision Model
    ├─ Analyzes image(s)
    └─ Returns product info as JSON
            ↓
Backend Response → Frontend
    ├─ Parse JSON response string
    └─ Display product information to user
```
