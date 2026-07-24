# AI-Powered Agricultural Product OCR & Receipt Reconciliation System

A modern full-stack web application designed for the agricultural sector. The system automates the process of scanning and parsing agricultural product labels (pesticides, fertilizers, seeds, fish feed) and digitalizing/reconciling complex delivery notes and purchase invoices.

**Live Demo URL:** [Click here](https://nhan-dien-nhan.vercel.app/)

---

## 🌟 Core Features

### 1. AI Product Label Scanner & Enrichment (`/api/image/analyze`)
* **Categorized Vision Extraction**: Automatically parses structural information from label images for four distinct domains:
  * **Pesticides (Thuốc nông dược)**: Ingredients, manufacturers, registration numbers, dosages, PHI (pre-harvest interval), target pests/crops.
  * **Fertilizers (Phân bón)**: Chemical composition, usage instructions, weight, manufacturing & expiry dates.
  * **Fish Feed (Thức ăn thủy sản)**: Nutrition details (crude protein, crude fiber, moisture), variant codes, species-specific feeding guides.
  * **Seeds (Hạt giống)**: Quality criteria (germination rate, purity, moisture), cropping seasons, manufacturer lot numbers.
* **Intelligent Web-Search & Enrichment**: Cross-checks and completes missing specifications by crawling and matching extracted parameters against national pesticide/fertilizer registration databases.
* **Dual-View Side-by-Side Comparison**: Visually compares raw image extractions against enriched search data in real-time.

### 2. Intelligent Receipt OCR & Math Reconciliation (`/api/receipt/analyze`)
* **Multi-Page PDF & Image Pipeline**: Accepts up to 10 page uploads, converting PDF pages to high-resolution images completely in memory.
* **Universal Document Classification**: Identifies and separates files into:
  * **Delivery Notes (Phiếu xuất/nhập kho)**: Validates total bag count and net weights.
  * **Invoices (Hóa đơn bán hàng)**: Validates quantities, unit prices, line item sub-totals, and grand totals.
* **Automated Math Reconciliation Engine**: Cross-checks arithmetic consistency:
  * **Line-Item Checks**: Confirms whether $\text{Quantity} \times \text{Unit Price} = \text{Total Amount}$ (for Invoices) or $\text{Net Content} \times \text{Bag Count} = \text{Total Weight}$ (for Delivery Notes).
  * **Summary Checks**: Verifies if the sum of all line item totals matches the declared `grand_total` or `total_weight_kg`.
  * **Warning Alerts**: Inconsistencies dynamically flag a `MATH_MISMATCH` warn-badge and highlight the specific matching table rows.

### 3. Multi-Sheet Excel Export (.xlsx)
* Generates native binary `.xlsx` files on-the-fly via SheetJS.
* Exports multiple receipts into a single workbook, with each invoice or delivery note placed on a separate sheet tab.

---

## 🛠️ Technology Stack

### Frontend
* **Core**: React 19, TypeScript, Vite, Tailwind CSS 4, shadcn/ui.
* **PDF Engine**: `react-pdf` for rendering PDF canvases with custom worker configuration.
* **Zoom & Pan**: `react-zoom-pan-pinch` for analyzing detailed physical documents.
* **Export Utilities**: `xlsx` (SheetJS) for binary spreadsheet downloads.

### Backend
* **Core**: Node.js, Express, TypeScript, Esbuild.
* **Vision & AI Model**: Gemini 3.5 Flash & 3.1 Flash-Lite API using multimodal prompts and strict structural JSON schema boundaries.
* **PDF Converter**: `pdf-to-png-converter` utilizing Node-native bindings for ultra-fast, in-memory PDF page rendering without filesystem pollution.
* **Validation**: Zod schema validation ensuring consistent JSON shape mapping.

---

## 📁 Repository Structure

```
NhanDienNhan/
├── README.md                # Project introduction and setup guide
├── docker.txt               # Docker instructions
└── NhanDienNhan_v2/
    ├── backend/             # Express API Server
    │   ├── src/
    │   │   ├── routes/      # Image and Receipt endpoints
    │   │   ├── services/    # Gemini LLM and Web-Search integrations
    │   │   ├── validation/  # Zod validation schemas
    │   │   └── utils/       # Date formatting and math reconciler engines
    │   ├── Dockerfile
    │   └── package.json
    └── frontend/            # React Client Application
        ├── src/
        │   ├── apis/        # API request wrappers
        │   ├── components/  # Receipt/Image Upload, Results and PDF Viewers
        │   └── App.tsx      # Main application router and state manager
        └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v18+` or higher.
* **NPM**: `v9+` or higher.
* **API Keys**: A valid Gemini API Key.

### 1. Setup the Backend
1. Navigate into the backend workspace:
   ```bash
   cd NhanDienNhan_v2/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the backend root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Start the backend developer server:
   ```bash
   npm run dev
   ```

### 2. Setup the Frontend
1. Navigate into the frontend workspace:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the frontend root directory:
   ```env
   VITE_BACKEND_URL=http://localhost:5000
   ```
4. Start the frontend developer server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.

---

## 🐳 Docker Deployment

The backend contains a prepared `Dockerfile` for easy container deployment.

### Build and Run with Docker
1. Navigate to the backend directory:
   ```bash
   cd NhanDienNhan_v2/backend
   ```
2. Build the Docker image:
   ```bash
   docker build -t nhan-dien-nhan-backend:latest .
   ```
3. Run the container:
   ```bash
   docker run -p 5000:5000 -e GEMINI_API_KEY="your_gemini_api_key" nhan-dien-nhan-backend:latest
   ```

---

## 💡 Engineering Highlights

* **In-Memory PDF processing**: Avoids the performance bottleneck and cleanup hazards of writing temporary files to the disk by processing raw PDF data streams directly into buffer-backed images.
* **Rigorous Data Quality Engine**: Combines generative AI vision with structural deterministic rules (math validation) to verify financial calculations, showing how AI and business logic complement each other.
* **Modern CSS & Typography Design**: Uses a rich, fully responsive design built on Tailwind CSS 4 and fluid micro-interactions (zoom, drag-and-drop, and continuous document previewing).