# Component API Reference

## ImageUpload Component

### Props
```typescript
interface ImageUploadProps {
  onFilesSelected: (files: File[]) => void;
  isLoading?: boolean;
}
```

### Features
- Drag and drop support
- Multiple file selection (max 3)
- Image preview with remove buttons
- Sample images quick-add
- File validation
- Error messaging

### Usage
```tsx
<ImageUpload 
  onFilesSelected={(files) => setSelectedFiles(files)}
  isLoading={isLoading}
/>
```

---

## ProductResults Component

### Props
```typescript
interface ProductResultsProps {
  data: ProductData;
  images: File[];
  onReset: () => void;
}

interface ProductData {
  success: boolean;
  message?: string;
  error_code?: string;
  product_name?: string;
  product_type?: string;
  manufacturer?: string;
  registration_number?: string;
  active_ingredients?: Array<{ name: string; content: string }>;
  dosage?: string;
  target_crops?: string[];
  target_pests?: string[];
  pre_harvest_interval_days?: number;
  confidence_score?: number;
}
```

### Features
- Display extracted product information
- Show uploaded images
- Error state handling
- Confidence score indicator
- Responsive layout
- Reset button

### Usage
```tsx
<ProductResults 
  data={productInfo}
  images={selectedFiles}
  onReset={() => resetApp()}
/>
```

---

## LoadingIndicator Component

### Features
- Animated spinner
- Loading text
- Centered layout

### Usage
```tsx
<LoadingIndicator />
```

---

## API Functions

### parseProductInfo
Parses the API response and extracts product information.

```typescript
const productInfo = parseProductInfo(response);
```

### uploadMultipleImagesForAnalysis
Uploads multiple images to the backend for analysis.

**Note**: This function automatically includes `parsed=true` and `formatDates=true` query parameters to request that the backend return parsed JSON responses with formatted dates.

```typescript
const response = await uploadMultipleImagesForAnalysis(files, "pesticide");
const productData = parseProductInfo(response);
```

**Response Date Format**: 
- When `formatDates=true` is passed (default behavior):
  - `mfg_date`: Formatted as `dd/mm/yyyy`
  - `exp_date`: Formatted as `dd/mm/yyyy` (either an exact date or calculated from shelf life)
- The backend automatically detects and formats various date input formats: `dd/mm/yy`, `dd mm yyyy`, `dd.mm.yyyy`, etc.
- If `exp_date` is a shelf life duration (e.g., "18 tháng", "2 năm"), the backend calculates the expiry date from the manufacturing date

---

## Date Handling

### Date Processing (Backend)
The backend processes dates through the following flow:
1. Receives raw product information from OpenAI
2. Detects date fields: `mfg_date` and `exp_date`
3. Formats dates: `mfg_date` to dd/mm/yyyy format
4. Handles shelf life: If `exp_date` contains duration keywords ("tháng", "năm", "ngày", "tuần"), calculates expiry date from manufacturing date
5. Returns formatted response to frontend

### Date Formats Supported
- **Input formats**: `dd/mm/yy`, `dd mm yy`, `dd/mm/yyyy`, `dd mm yyyy`, `dd.mm.yy`, `dd.mm.yyyy`, `dd-mm-yy`, `dd-mm-yyyy`
- **Output format**: `dd/mm/yyyy`
- **Shelf life formats**: 
  - Vietnamese: "18 tháng" (months), "2 năm" (years), "30 ngày" (days), "4 tuần" (weeks)
  - English: "18 months", "2 years", "30 days", "4 weeks"
  - Can include descriptive text: "18 tháng kể từ ngày sản xuất"

---

## State Management Pattern

The App component uses React hooks for state:

```typescript
const [viewState, setViewState] = useState<ViewState>("upload");
const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
const [productData, setProductData] = useState<ProductData | null>(null);
const [error, setError] = useState<string>("");
```

View states:
- `"upload"` - Upload interface visible
- `"loading"` - Processing indicator shown
- `"results"` - Results display shown

---

## Common Patterns

### Handling file selection
```tsx
const handleFilesSelected = (files: File[]) => {
  setSelectedFiles(files);
  setError("");
};
```

### Handling submission
```tsx
const handleSubmit = async () => {
  setViewState("loading");
  try {
    const response = await uploadMultipleImagesForAnalysis(selectedFiles);
    const productInfo = parseProductInfo(response);
    setProductData(productInfo);
    setViewState("results");
  } catch (err) {
    setError("Error message");
    setViewState("upload");
  }
};
```

### Resetting state
```tsx
const handleReset = () => {
  setSelectedFiles([]);
  setProductData(null);
  setError("");
  setViewState("upload");
};
```

---

## Tailwind CSS Classes Used

### Layout
- `grid grid-cols-*` - Responsive grids
- `flex flex-wrap` - Flexible layouts
- `max-w-*` - Max width containers
- `gap-*` - Spacing between elements

### Colors
- `bg-purple-*` - Purple backgrounds
- `text-purple-*` - Purple text
- `border-purple-*` - Purple borders
- `text-white` - White text
- `bg-linear-to-*` - Gradient backgrounds

### Effects
- `rounded-*` - Border radius
- `shadow-*` - Box shadows
- `opacity-*` - Opacity
- `hover:*` - Hover states
- `transition-*` - Smooth transitions

### Responsive
- `sm:` - Small screens (640px+)
- `md:` - Medium screens (768px+)
- `lg:` - Large screens (1024px+)

---

## Theme Colors

Primary: Purple (`from-purple-600 to-purple-700`)
- Light: `purple-50` (backgrounds)
- Dark: `purple-700` (text)
- Accent: `purple-600`

Secondary: Blue (`blue-50`, `blue-400`)
Secondary: Orange (`orange-50`, `orange-400`)
Secondary: Green (`green-600`)

---

## Icons (Lucide React)

- `Upload` - File upload icon
- `X` - Close/remove icon
- `Loader2` - Loading spinner icon
- `AlertCircle` - Error indicator
- `CheckCircle2` - Success indicator

---

## Responsive Breakpoints

```
Mobile first (default):  < 640px
Small (sm):              ≥ 640px
Medium (md):             ≥ 768px
Large (lg):              ≥ 1024px
XL (xl):                 ≥ 1280px
2XL (2xl):               ≥ 1536px
```

---

## TypeScript Types

All components are fully typed with TypeScript. Key interfaces:

- `ProductData` - Product information
- `ImageUploadProps` - ImageUpload component props
- `ProductResultsProps` - ProductResults component props
- `ImageAnalysisResponse` - API response type
- `MultipleImagesResponse` - Multiple images API response

---

## File Upload Constraints

- Maximum files: 3
- Accepted formats: All image types (`image/*`)
- File size: No explicit limit (configured server-side)
- Preview: Generated with FileReader API
- Sample images: RidomilGold 1.jpg, RidomilGold 2.jpg

---

## Error Handling

Errors are displayed with:
- Clear message to user
- Error code if available
- Visual red styling
- State reset to upload view

Example error display:
```tsx
{error && (
  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-red-700 text-sm">
    {error}
  </div>
)}
```
