# Tài liệu Response Schema - Receipt OCR

Tài liệu này giải thích chi tiết cấu trúc dữ liệu trả về (API Response Schema) cho tính năng trích xuất thông tin hóa đơn / phiếu mua hàng vật tư nông nghiệp (Receipt OCR).

---

## 1. Thông tin API (API Endpoint)

### Trích xuất thông tin từ hóa đơn / phiếu mua vật tư

**URL**: `POST http://localhost:5000/api/receipt/analyze`

**Content-Type**: `multipart/form-data`

**Body**:
* `images`: Một hoặc nhiều file ảnh hóa đơn / phiếu mua hàng (tối đa 10 ảnh, dung lượng tối đa 10MB/ảnh).

**Đặc điểm**:
* Luôn tự động phân tích dữ liệu sang cấu trúc JSON (`parsed = true`).
* Luôn tự động chuẩn hóa định dạng ngày tháng trong hóa đơn (`formatDates = true`).
* Không yêu cầu tham số truy vấn bổ sung (Query Parameters).

---

## 2. Khung Response Tổng (Top-level Response Wrapper)

```json
{
  "success": true,
  "data": {
    "response": { ... },
    "totalImages": 1
  }
}
```

### success (boolean)
Cho biết request tổng thể có được xử lý thành công hay không.

### data (object)
Chứa kết quả bóc tách và thông tin tổng quan.

* **data.response** (object): Kết quả trích xuất cấu trúc hóa đơn chi tiết (xem chi tiết ở Mục 3).
* **data.totalImages** (number): Tổng số lượng ảnh hóa đơn đã xử lý trong lượt yêu cầu này.

---

## 3. Cấu trúc chi tiết `data.response`

### success (boolean)
Cho biết việc bóc tách thông tin từ ảnh hóa đơn có thành công hay không.

### error_code (string enum)
Mã lỗi nếu quá trình phân tích hoặc nhận dạng thất bại.
* `NONE`: Không có lỗi.
* `BLURRY_IMAGE`: Ảnh quá mờ, không nhận dạng được chữ.
* `WRONG_PRODUCT_CATEGORY`: Ảnh được gửi không phải là hóa đơn / phiếu mua hàng.
* `TEXT_NOT_READABLE`: Chữ viết tay hoặc chữ in quá mờ, bị rách/che khuất hoàn toàn.
* `MISSING_LABEL`: Thiếu phần thông tin cốt lõi của phiếu.
* `UNKNOWN`: Lỗi không xác định.

### message (string)
Thông báo chi tiết bằng tiếng Việt để hiển thị lên giao diện người dùng.

### metadata (object | null)
Thông tin độ tin cậy và danh sách các cảnh báo (Để `null` nếu ảnh lỗi nặng hoặc không thể phân tích được gì).

* **metadata.overall_confidence** (number): Điểm số độ tin cậy tổng thể của quá trình OCR (giá trị từ `0` đến `1`).
* **metadata.review_warnings** (array): Danh sách các trường nghi ngờ hoặc lỗi logic cần con người kiểm tra lại. Mỗi phần tử bao gồm:
  * `field` (string | null): Đường dẫn của trường bị nghi ngờ (Ví dụ: `items.0.unit_price`). Sẽ là `null` nếu là lỗi toàn cục (Ví dụ: ảnh bị ngược).
  * `issue` (string enum): Phân loại lỗi, ví dụ:
    * `TEXT_BLURRY`: Chữ bị mờ.
    * `TEXT_OVERLAPPED`: Chữ ký, dấu mộc đỏ hoặc vết bẩn đè lên văn bản.
    * `MATH_MISMATCH`: Sai lệch số học (Ví dụ: Số lượng * Đơn giá khác Thành tiền, hoặc tổng các dòng không khớp với Tổng thanh toán).
    * `IMAGE_ROTATED`: Ảnh bị xoay ngang hoặc xoay ngược.
  * `message` (string): Mô tả chi tiết lỗi bằng tiếng Việt cho người duyệt xem.

### data (object | null)
Dữ liệu chi tiết của hóa đơn / phiếu mua hàng trích xuất được.

---

## 4. Chi tiết cấu trúc `data.response.data`

Dưới đây là chi tiết các trường dữ liệu nằm bên trong đối tượng `data`:

| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `category` | string (literal) | Luôn là `"receipt"` |
| `supplier_name` | string \| null | Tên đại lý, cửa hàng hoặc công ty bán vật tư nông nghiệp |
| `customer_name` | string \| null | Tên người mua hàng hoặc chủ nông trại |
| `purchase_date` | string \| null | Ngày mua hàng hoặc lập phiếu. Đã chuẩn hóa về dạng `DD/MM/YYYY` (Ví dụ: `16/07/2026`). Nếu không rõ năm thì giữ nguyên gốc văn bản |
| `receipt_number` | string \| null | Số phiếu / Số hóa đơn (nếu có) |
| `grand_total` | number \| null | Tổng tiền phải thanh toán cuối cùng của toàn bộ phiếu (kiểu số nguyên/số thực, đã loại bỏ ký tự tiền tệ và dấu ngăn cách nghìn) |
| `notes` | string \| null | Ghi chú chung trên phiếu (Ví dụ: *"Nợ lại vụ sau"*, *"Đã thanh toán tiền mặt"*) |
| `items` | array | Danh sách các dòng vật tư chi tiết trích xuất từ bảng hóa đơn |

### Chi tiết cấu trúc từng dòng vật tư trong danh sách `items`

Mỗi phần tử trong mảng `items` đại diện cho một dòng sản phẩm được mua:

| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `product_name` | string \| null | Tên đầy đủ của vật tư/sản phẩm ghi trên dòng (Ví dụ: `"Phân bón NPK 16-16-8"`, `"Thuốc trừ sâu Haihamec"`) |
| `quantity` | number \| null | Số lượng mua (được chuyển đổi thành kiểu số, Ví dụ: `5` hoặc `10.5`) |
| `unit` | string \| null | Đơn vị tính ghi trên dòng (Ví dụ: `"bao"`, `"chai"`, `"gói"`, `"kg"`) |
| `unit_price` | number \| null | Đơn giá của 1 đơn vị sản phẩm (Ví dụ: `120000`) |
| `total_amount` | number \| null | Thành tiền của dòng vật tư đó = Số lượng * Đơn giá (Ví dụ: `600000`) |

---

## 5. Ví dụ về API Response thành công

```json
{
  "success": true,
  "data": {
    "response": {
      "success": true,
      "error_code": "NONE",
      "message": "Trích xuất thông tin hóa đơn thành công",
      "metadata": {
        "overall_confidence": 0.95,
        "review_warnings": []
      },
      "data": {
        "category": "receipt",
        "supplier_name": "Đại lý Vật tư Nông nghiệp Minh Thư",
        "customer_name": "Nguyễn Văn A",
        "purchase_date": "16/07/2026",
        "receipt_number": "HD-2026-0089",
        "grand_total": 2400000,
        "notes": "Đã thanh toán bằng chuyển khoản",
        "items": [
          {
            "product_name": "Phân bón NPK Đầu Trâu 20-20-15",
            "quantity": 2,
            "unit": "bao",
            "unit_price": 900000,
            "total_amount": 1800000
          },
          {
            "product_name": "Thuốc trừ sâu Anvil 5SC",
            "quantity": 5,
            "unit": "chai",
            "unit_price": 120000,
            "total_amount": 600000
          }
        ]
      }
    },
    "totalImages": 1
  }
}
```
