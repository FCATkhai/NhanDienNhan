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
    - Accepts query parameter: `category=pesticide|fish_feed` (default: `pesticide`)
    - Routes to appropriate processor based on category
- Validates image files using multer
- Limits file size to 10MB per image
- Automatically selects analysis schema based on category

#### 3. Updated `src/app.ts`
- Registers image routes
- Added health check endpoint (`GET /health`)

## Product Categories

The API supports two product analysis categories with distinct schemas:

### Pesticide Category (`category=pesticide`)
**Default category when not specified**

Used for analyzing agricultural pesticide, fungicide, herbicide, and other chemical products.

**Extracted Fields:**
- `product_name` - Name of the pesticide product
- `product_type` - Type (Insecticide, Fungicide, Herbicide, etc.)
- `manufacturer` - Manufacturing company
- `registration_number` - Official registration/approval number
- `form_type` - Product form (powder, liquid, granules, etc.)
- `net_content` - Package size
- `net_unit` - Unit of measurement (g, kg, ml, l, etc.)
- `active_ingredients` - List of active ingredients with percentages
- `dosage` - Recommended dosage and application instructions
- `target_crops` - Crops the product is used on
- `target_pests` - Pests/diseases the product targets
- `pre_harvest_interval_days` - Days to wait before harvest after application
- `mfg_date` - Manufacturing date
- `exp_date` - Expiration date
- `confidence_score` - Extraction confidence (0-1)

### Fish Feed Category (`category=fish_feed`)
Used for analyzing aquaculture feed products and specifications.

**Extracted Fields:**
- `product_name` - Name of the feed product
- `variant_code` - Product variant/batch code
- `species` - Fish species the feed is for
- `manufacturer` - Manufacturing company
- `product_type` - Feed type classification
- `form_type` - Product form
- `net_content` - Package size/weight
- `net_unit` - Unit of measurement (kg, g, etc.)
- `ingredients` - Ingredient list
- `nutrition_facts` - Nutritional composition (protein, fat, fiber, minerals, etc.)
- `feeding_guide` - Feeding instructions by fish size/weight
- `mfg_date` - Manufacturing date
- `exp_date` - Expiration date
- `confidence_score` - Extraction confidence (0-1)

### Backend Endpoints

#### Unified Image Analysis
**Endpoint:** `POST http://localhost:5000/api/image/analyze`

Accepts 1-10 images and analyzes based on the specified category.

**Query Parameters:**
- `category` (String, optional): `pesticide` or `fish_feed` (default: `pesticide`)

**Request:**
```
Content-Type: multipart/form-data

Query:
- category=pesticide (or fish_feed)

Fields:
- images (File[]): Image files to analyze (1-10 files)
- prompt (String, optional): Custom prompt
```

**Response (Pesticide - Success):**
```json
{
    "success": true,
    "data": {
        "response": "{\"data\":{\"active_ingredients\":[{\"content\":\"40 g/kg\",\"name\":\"Metalaxyl\"},{\"content\":\"640 g/kg\",\"name\":\"Mancozeb\"},{\"content\":\"320 g/kg\",\"name\":\"Phụ gia\"}],\"category\":\"pesticide\",\"dosage\":null,\"exp_date\":null,\"form_type\":\"bot\",\"manufacturer\":\"Công ty TNHH Syngenta Việt Nam\",\"mfg_date\":null,\"net_content\":\"100\",\"net_unit\":\"g\",\"pre_harvest_interval_days\":14,\"product_name\":\"Ridomil Gold 68 WG\",\"product_type\":\"Thuốc trừ bệnh\",\"registration_number\":null,\"target_crops\":[\"lúa\",\"lạc\"],\"target_pests\":[\"bệnh phấn trắng lúa, bện s rầy nâu, bệnh lem lép hạt, bệnh đạo ôn lá và cổ bông\"]},\"error_code\":\"NONE\",\"message\":\"Trích xuất thông tin sản phẩm thuốc bảo vệ thực vật thành công.\",\"metadata\":{\"overall_confidence\":0.9,\"review_warnings\":[{\"field\":\"dosage\",\"issue\":\"BLURRY_TEXT\",\"message\":\"Không thể đọc rõ liều lượng sử dụng do chữ nhỏ và bị chói sáng.\"}]},\"success\":true}",
        "totalImages": 2
    }
}
```

**Response (Fish Feed - Success):**
```json
{
    "success": true,
    "data": {
        "response": "{\"data\":{\"category\":\"fish_feed\",\"exp_date\":null,\"feeding_guide\":{\"code\":\"MK 831\",\"guide\":[{\"name\":\"Khối lượng cá (g/con)\",\"value\":\"10 - 100\"},{\"name\":\"Tỷ lệ (%) so với khối lượng đàn cá\",\"value\":\"4 - 6\"},{\"name\":\"Số lần cho ăn /ngày\",\"value\":\"3 - 4\"}]},\"form_type\":null,\"ingredients\":\"Bột cá cao cấp, bột đậu nành, bột mì, cám gạo, chất dẫn dụ, Vitamin và khoáng, ...\",\"manufacturer\":\"CTY TNHH MTV THỨC ĂN THỦY SẢN MEKONG\",\"mfg_date\":null,\"net_content\":\"25\",\"net_unit\":\"Kg\",\"nutrition_facts\":[{\"name\":\"Độ ẩm (%) max\",\"unit\":null,\"value\":\"11\"},{\"name\":\"Protein thô (%) min\",\"unit\":null,\"value\":\"31\"},{\"name\":\"Béo thô (%) min\",\"unit\":null,\"value\":\"6\"},{\"name\":\"Xơ thô (%) max\",\"unit\":null,\"value\":\"5\"},{\"name\":\"Ca (%) min\",\"unit\":null,\"value\":\"1.3\"},{\"name\":\"P tổng số (%) min\",\"unit\":null,\"value\":\"1.0\"},{\"name\":\"Lysine tổng số (%) min\",\"unit\":null,\"value\":\"1.8\"},{\"name\":\"Ethoxy quin (ppm)\",\"unit\":null,\"value\":\"< 150\"}],\"product_name\":\"THỨC ĂN THỦY SẢN MEKONG MK 831\",\"product_type\":\"Thức ăn hỗn hợp cho cá rô phi, điêu hồng\",\"species\":null,\"variant_code\":\"MK 831\"},\"error_code\":\"NONE\",\"message\":\"Trích xuất thông tin sản phẩm thức ăn thủy sản MEKONG MK 831 thành công\",\"metadata\":{\"overall_confidence\":0.95,\"review_warnings\":[]},\"success\":true}",
        "totalImages": 2
    }
}
```

**Response (Success with Warnings):**
```json
{
    "success": true,
    "data": {
        "response": "{\"data\":{\"category\":\"fish_feed\",\"exp_date\":null,\"feeding_guide\":{\"code\":\"MK 831\",\"guide\":[{\"name\":\"Tỷ lệ (%) so với khối lượng dân Cá\",\"value\":\"3 - 4\"},{\"name\":\"Số lần cho ăn /ngày\",\"value\":\"3\"}]},\"form_type\":null,\"ingredients\":\"Bột cá cao cấp, bột đậu nành, bột mì, cám gạo, chất dẫn dụ, Vitamin và khoáng, ...\",\"manufacturer\":\"CTY TNHH MTV THỨC ĂN THỦY SẢN MEKONG\",\"mfg_date\":null,\"net_content\":\"25\",\"net_unit\":\"Kg\",\"nutrition_facts\":null,\"product_name\":\"MK 831\",\"product_type\":null,\"species\":\"cá rô phi, điêu hồng\",\"variant_code\":\"MK 831\"},\"error_code\":\"NONE\",\"message\":\"Trích xuất thông tin thành công.\",\"metadata\":{\"overall_confidence\":0.85,\"review_warnings\":[{\"confidence\":0.8,\"field_path\":\"feeding_guide\",\"issue\":\"OBSCURED_DATA\",\"message\":\"Hướng dẫn cho ăn phần mã MK 831 bị bôi xóa/mỏi mực, không thể đọc rõ ràng thông tin tài liệu chi tiết.\"},{\"confidence\":0.8,\"field_path\":\"nutrition_facts\",\"issue\":\"OBSCURED_DATA\",\"message\":\"Bảng thành phần dinh dưỡng bị gạch chéo nên không thể trích xuất dữ liệu chính xác.\"}]},\"success\":true}",
        "totalImages": 2
    }
}
```

**Warnings Structure:** When extraction succeeds but with quality concerns, the response includes `metadata` with:
- `overall_confidence` - Overall extraction confidence (0-1)
- `review_warnings` - Array of warning objects with:
  - `confidence` - Confidence level for that specific field (0-1)
  - `field_path` - Path to the field with quality issues
  - `issue` - Type of issue (e.g., `OBSCURED_DATA`, `BLURRY_TEXT`)
  - `message` - Description of the quality issue

**Response (Error - Extraction Failure):**
```json
{
  "success": true,
  "data": {
    "response": "{\"success\":false,\"error_code\":\"BLURRY_IMAGE\",\"message\":\"Image is too blurry to read text\",\"product_name\":null,\"confidence_score\":0.2}",
    "totalImages": 1
  }
}
```

**Note:** The `response` field contains product information as a JSON string that needs to be parsed on the client side. The LLM returns a structured object with status fields (`success`, `error_code`, `message`) and product data fields. The structure varies based on category:

- **Pesticide Category** (default): Returns fields like `product_name`, `manufacturer`, `product_type`, `form_type`, `net_content`, `net_unit`, `active_ingredients`, `dosage`, `target_crops`, `target_pests`, `registration_number`, `pre_harvest_interval_days`, `mfg_date`, `exp_date`
- **Fish Feed Category**: Returns fields like `product_name`, `variant_code`, `species`, `manufacturer`, `product_type`, `form_type`, `net_content`, `net_unit`, `feeding_guide`, `nutrition_facts`, `ingredients`, `mfg_date`, `exp_date`

## Frontend Setup

### File Created
`src/apis/imageApi.ts` - Contains utility functions for uploading images

### Usage Example (Single or Multiple Images)

```tsx
import { uploadMultipleImagesForAnalysis, parseProductInfo } from '@/apis/imageApi';

function ImageUploadComponent() {
  const [category, setCategory] = useState<'pesticide' | 'fish_feed'>('pesticide');

  const handleImageUpload = async (files: File[]) => {
    // Works with 1-10 images, routes based on category
    const result = await uploadMultipleImagesForAnalysis(files);
    
    if (result.success && result.data?.response) {
      // Parse the response string to get product info
      const productInfo = parseProductInfo(result);
      
      // Check if extraction was successful
      if (productInfo.success) {
        console.log("Category:", category);
        console.log("Product:", productInfo.product_name);
        console.log("Confidence:", productInfo.confidence_score);
        console.log("Total images analyzed:", result.data?.totalImages);
        
        // Access category-specific fields
        if (category === 'pesticide') {
          console.log("Manufacturer:", productInfo.manufacturer);
          console.log("Target crops:", productInfo.target_crops);
          console.log("Target pests:", productInfo.target_pests);
        } else if (category === 'fish_feed') {
          console.log("Species:", productInfo.species);
          console.log("Feeding guide:", productInfo.feeding_guide);
          console.log("Nutrition facts:", productInfo.nutrition_facts);
        }
      } else {
        // Handle extraction failure
        console.error("Extraction failed:", productInfo.error_code);
        console.error("Message:", productInfo.message);
      }
    } else {
      // Handle upload/server error
      console.error("Upload error:", result.message);
    }
  };

  return (
    <div>
      <select value={category} onChange={(e) => setCategory(e.target.value as 'pesticide' | 'fish_feed')}>
        <option value="pesticide">Pesticide</option>
        <option value="fish_feed">Fish Feed</option>
      </select>
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
interface ParsedProductResponse {
  success: boolean;
  errorCode: string | null;
  message: string;
  productName: string | null;
  manufacturer: string | null;
  type: string | null;
  activeIngredients: Array<{ name: string; content: string }> | null;
  targetCrops: string[] | null;
  targetPests: string[] | null;
  dosage: string | null;
  registrationNumber: string | null;
  preHarvestInterval: number | null;
  expiryDate: string | null;
  confidence: number;
  totalImages: number;
}

function parseProductResponse(responseData: any): ParsedProductResponse {
  const productInfo = JSON.parse(responseData.response);
  
  if (!productInfo.success) {
    // Handle extraction failure
    return {
      success: false,
      errorCode: productInfo.error_code,
      message: productInfo.message,
      productName: null,
      manufacturer: null,
      type: null,
      activeIngredients: null,
      targetCrops: null,
      targetPests: null,
      dosage: null,
      registrationNumber: null,
      preHarvestInterval: null,
      expiryDate: null,
      confidence: productInfo.confidence_score || 0,
      totalImages: responseData.totalImages
    };
  }
  
  // Handle successful extraction
  return {
    success: true,
    errorCode: null,
    message: productInfo.message,
    productName: productInfo.product_name,
    manufacturer: productInfo.manufacturer,
    type: productInfo.product_type,
    activeIngredients: productInfo.active_ingredients,
    targetCrops: productInfo.target_crops,
    targetPests: productInfo.target_pests,
    dosage: productInfo.dosage,
    registrationNumber: productInfo.registration_number,
    preHarvestInterval: productInfo.pre_harvest_interval_days,
    expiryDate: productInfo.expiry_date,
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

### HTTP Status Codes
- `200` - Request processed (check `productInfo.success` for extraction result)
- `400` - Bad request (no file, invalid format, size limit exceeded)
- `500` - Server error (OpenAI API failure, processing error)

### Server Error Response (Upload/Processing Failure)
```json
{
  "success": false,
  "error": "Only image files are allowed"
}
```

### LLM Error Response (Extraction Failure)
When the LLM cannot extract product information, it returns a 200 response with:
```json
{
  "success": true,
  "data": {
    "response": "{\"success\":false,\"error_code\":\"BLURRY_IMAGE\",\"message\":\"Image is too blurry to read text\",\"product_name\":null,\"confidence_score\":0}",
    "totalImages": 1
  }
}
```

### Error Codes
- `NONE` - No error, extraction successful (may include warnings)
- `BLURRY_IMAGE` - Image quality too poor to read
- `NOT_A_PRODUCT` - Image doesn't contain a product label
- `TEXT_NOT_READABLE` - Text on label cannot be read clearly
- `MISSING_LABEL` - Product doesn't have a visible label
- `UNKNOWN` - Unknown error during extraction

### Warning Issue Types
- `BLURRY_TEXT` - Text is blurry or difficult to read
- `OBSCURED_DATA` - Data is partially obscured or crossed out
- `LOW_CONTRAST` - Poor contrast makes text hard to read
- `PARTIAL_LABEL` - Label is cut off or partially visible
- `MULTIPLE_PRODUCTS` - Multiple products visible, uncertain which to extract

## Testing with cURL

### Single Image (Pesticide - Default)
```bash
curl -X POST http://localhost:5000/api/image/analyze \
  -F "images=@/path/to/image.jpg"
```

### Single Image (Fish Feed)
```bash
curl -X POST "http://localhost:5000/api/image/analyze?category=fish_feed" \
  -F "images=@/path/to/image.jpg"
```

### Multiple Images (Pesticide - Default)
```bash
curl -X POST http://localhost:5000/api/image/analyze \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "images=@/path/to/image3.jpg"
```

### Multiple Images (Fish Feed)
```bash
curl -X POST "http://localhost:5000/api/image/analyze?category=fish_feed" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

## Architecture Flow

```
Frontend (React)
    ↓
    ├─ Select category: pesticide (default) or fish_feed
    ├─ Select 1-10 image(s)
    └─ uploadMultipleImagesForAnalysis(files)
            ↓
    HTTP POST multipart/form-data
    Query: ?category=pesticide (or fish_feed)
            ↓
Backend Express Server
    └─ POST /api/image/analyze?category=...
            ↓
Multer (File handling)
    ├─ Validates file type
    ├─ Limits file size (10MB each)
    └─ Stores in memory
            ↓
imageRoutes.ts (Category-Based Routing)
    ├─ Check query parameter: category=pesticide|fish_feed
    ├─ Default to: pesticide
    └─ Select appropriate prompt and schema
            ↓
processImagesWithOpenAI()
    ├─ Converts images to base64
    ├─ Sends with category-specific prompt
    └─ Routes to OpenAI Vision API
            ↓
OpenAI Vision Model
    ├─ Analyzes image(s)
    ├─ Uses category-specific schema
    └─ Returns structured product info as JSON
            ↓
Backend Response → Frontend
    ├─ Parse JSON response string
    ├─ Display category-specific fields to user
    └─ Show confidence score and warning messages (if any)
```