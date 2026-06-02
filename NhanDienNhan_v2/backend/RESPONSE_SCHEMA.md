# Tài liệu Response Schema

Tài liệu này giải thích toàn bộ các trường trong API response trích xuất thông tin sản phẩm.
Bao gồm khung response chung và trường riêng cho:

- Thuốc bảo vệ thực vật/thuốc thủy sản (pesticide)
- Thức ăn thủy sản (fish_feed)

Lưu ý:

- Tất cả trường dưới đây có thể xuất hiện kể cả khi giá trị là null.
- Chuỗi văn bản được trả về đúng như trên nhãn (không tự động chuẩn hóa).

---

## 1. Khung Response Tổng

### success (boolean)

Cho biết request tổng thể có xử lý thành công hay không.

### data (object)

Chứa kết quả trích xuất và thông tin bổ sung.

#### data.response (object)

Kết quả trích xuất và trạng thái của sản phẩm, nếu query parsed=true thì trả về kiểu json, còn không thì trả về dạng JSON.stringify().

#### data.totalImages (number)

Tổng số ảnh đã xử lý trong request.

---

## 2. Đối tượng data.response

### success (boolean)

Cho biết việc trích xuất có thành công hay không.

### error_code (string enum)
Mã lỗi nếu trích xuất thất bại.
Giá trị có thể:
- NONE
- BLURRY_IMAGE
- WRONG_PRODUCT_CATEGORY
- TEXT_NOT_READABLE
- MISSING_LABEL
- UNKNOWN

### message (string)
Thông báo thân thiện cho UI.

### metadata (object | null)
Thông tin độ tin cậy và cảnh báo cần người kiểm tra. Để null nếu ảnh quá mờ
và không trích xuất được gì.

#### metadata.overall_confidence (number, 0..1)
Độ tin cậy tổng thể của OCR/trích xuất.

#### metadata.review_warnings (array)
Danh sách trường cần người xem lại. Mảng rỗng nếu không có vấn đề.

Mỗi phần tử trong review_warnings:
- field (string): Tên trường nghi ngờ.
- issue (string): Loại lỗi (ví dụ: TEXT_BLURRY, TABLE_UNCLEAR, AMBIGUOUS_VALUE).
- message (string): Mô tả bằng tiếng Việt cho người duyệt.

### data (object | null)
Dữ liệu sản phẩm đã trích xuất. Cấu trúc phụ thuộc danh mục.

---

## 3. Trường Chung Cho Tất Cả Danh Mục

Những trường này xuất hiện ở mọi danh mục sản phẩm.

### category (string enum)
Danh mục sản phẩm.
Giá trị có thể:
- fish_feed
- pesticide
- fertilizer
- unknown

### form_type (string enum | null)
Dạng vật lý của sản phẩm.
Giá trị có thể:
- bot
- nuoc
- vien
- khac

### manufacturer (string | null)
Tên nhà sản xuất.

### product_name (string | null)
Tên sản phẩm.

### net_content (string | null)
Giá trị định lượng (chỉ lấy số, dạng chuỗi).

### net_unit (string enum | null)
Đơn vị định lượng.
Giá trị có thể:
- gram
- kg
- lit
- m
- ml
- m2
- m3
- kwh

### package_type (string enum | null)
Quy cách đóng gói.
Giá trị có thể:
- bao
- bo
- cai
- cay
- con
- chai
- cuon
- goi
- hop
- lon
- can
- mieng
- ong
- tam
- thanh
- thung
- tui
- vien
- nguoi
- lan
- gio
- ngay
- thang
- nam

### uses (string | null)
Công dụng hoặc mục đích sử dụng.

### mfg_date (string | null)
Ngày sản xuất (NSX).

### exp_date (string | null)
Hạn sử dụng (HSD). Nếu nhãn chỉ ghi khoảng thời gian (ví dụ: "12 tháng"),
trả về nguyên văn.

---

## 4. Trường Riêng Cho Thuốc BVTV/Thủy Sản (category = "pesticide")

### product_type (string | null)
Loại sản phẩm.
Giá trị có thể:
- thuoc nong duoc
- thuoc thuy san
- khac

### registration_number (string | null)
Số đăng ký.

### ingredients (array | null)
Danh sách tất cả thành phần (hoạt chất, chất mang, phụ gia, độ ẩm...).

Mỗi phần tử trong ingredients:
- name (string): Tên thành phần.
- content (string | null): Hàm lượng (ví dụ: 50%, 1kg, vừa đủ).

### dosage (array | string | null)
Liều lượng sử dụng.
Nếu có hướng dẫn theo từng đối tượng/mục đích thì là mảng đối tượng:
- target (string): Đối tượng/mục đích áp dụng.
- amount (string): Liều lượng tương ứng.
Nếu chỉ có liều chung thì là chuỗi.

### target_crops (array | null)
Danh sách cây trồng/loài thủy sản áp dụng.

### target_pests (array | null)
Danh sách bệnh/dịch hại cần xử lý.

### pre_harvest_interval_days (number | null)
Thời gian cách ly trước thu hoạch (tính bằng ngày).

---

## 5. Trường Riêng Cho Thức Ăn Thủy Sản (category = "fish_feed")

### product_type (string | null)
Loại sản phẩm thức ăn.

### species (string | null)
Loài thủy sản áp dụng.

### ingredients (string | null)
Danh sách thành phần (chuỗi văn bản).

### variant_code (string | null)
Mã biến thể sản phẩm.

### nutrition_facts (array | null)
Thành phần dinh dưỡng cho biến thể được chọn.

Mỗi phần tử trong nutrition_facts:
- name (string): Tên chất dinh dưỡng (ưu tiên tiếng Việt, không tự dịch).
- value (string): Giá trị số (dạng chuỗi).
- unit (string | null): Đơn vị (g, mg, %, ...).

### feeding_guide (object | string | null)
Hướng dẫn cho ăn theo biến thể hoặc hướng dẫn chung.

Nếu là object (theo biến thể):
- code (string | null): Mã biến thể, phải trùng với variant_code nếu có.
- guide (array): Danh sách mục hướng dẫn.
	Mỗi phần tử:
	- name (string): Tên mục hướng dẫn.
	- value (string): Nội dung hướng dẫn.

Nếu là string: hướng dẫn chung cho sản phẩm.

---

## 6. Ví Dụ JSON Và Giải Thích

### 6.1. Ví dụ Pesticide

```json
{
    "success": true,
    "data": {
        "response": {
            "data": {
                "category": "pesticide",
                "dosage": "1kg/2.000m² (đối với ao quầng cạnh 1kg/5.000m²)",
                "exp_date": "04/05/2028",
                "form_type": null,
                "ingredients": [
                    {
                        "content": "50%",
                        "name": "Copper sulfate pentahydrate (min.)"
                    },
                    {
                        "content": "25%",
                        "name": "Độ ẩm (max)"
                    },
                    {
                        "content": "1kg",
                        "name": "Chất mang: bột cao lanh (vừa đủ)"
                    }
                ],
                "manufacturer": "CÔNG TY TNHH TM DV VINATOM 3979",
                "mfg_date": "04/05/2026",
                "net_content": "1",
                "net_unit": "kg",
                "package_type": null,
                "pre_harvest_interval_days": null,
                "product_name": "GANCLEAR3979",
                "product_type": "thuốc thuỷ sản",
                "registration_number": "0014:2022/VNT3979",
                "target_crops": [
                    "ao nuôi thuỷ sản"
                ],
                "target_pests": [
                    "Vibrio, tảo phát sáng, tảo lam, sứa, kí sinh trùng"
                ],
                "uses": "Chuyên diệt khuẩn Vibrio, tảo phát sáng, tảo lam, sứa, kí sinh trùng. Diệt khuẩn, nấm, kí sinh trùng, tảo độc, tôm chết rải rác."
            },
            "error_code": "NONE",
            "message": "Trích xuất thông tin sản phẩm thành công.",
            "metadata": {
                "overall_confidence": 0.95,
                "review_warnings": []
            },
            "success": true
        },
        "totalImages": 1
    }
}
```

Giải thích nhanh:
- `data.response.data.category`: xác định danh mục là pesticide.
- `ingredients`: danh sách thành phần, mỗi thành phần có `name` và `content`.
- `dosage`: liều lượng chung (chuỗi).
- `metadata`: độ tin cậy và cảnh báo; ở đây là 0.95 và không có cảnh báo.
- `totalImages`: số ảnh xử lý trong request.

### 6.2. Ví dụ Fish Feed

```json
{
    "success": true,
    "data": {
        "response": {
            "data": {
                "category": "fish_feed",
                "exp_date": "90 ngày kể từ ngày sản xuất",
                "feeding_guide": {
                    "code": "MK 831",
                    "guide": [
                        {
                            "name": "Tỷ lệ (%) so với khối lượng đàn cá",
                            "value": "4-6"
                        },
                        {
                            "name": "Số lần cho ăn/ngày",
                            "value": "3-4"
                        }
                    ]
                },
                "form_type": null,
                "ingredients": "Bột cá cao cấp, bột đậu nành, bột mì, cám gạo, chất dẫn dụ, Vitamin và khoáng, ...",
                "manufacturer": "CTY TNHH MTV THỨC ĂN THỦY SẢN MEKONG",
                "mfg_date": null,
                "net_content": "25",
                "net_unit": "kg",
                "nutrition_facts": [
                    {
                        "name": "Độ ẩm (%) max",
                        "unit": null,
                        "value": "11"
                    },
                    {
                        "name": "Protein thô (%) min",
                        "unit": null,
                        "value": "31"
                    },
                    {
                        "name": "Béo thô (%) max",
                        "unit": null,
                        "value": "6"
                    },
                    {
                        "name": "Xơ thô (%) max",
                        "unit": null,
                        "value": "5"
                    },
                    {
                        "name": "Ca (%) min",
                        "unit": null,
                        "value": "1.3"
                    },
                    {
                        "name": "P tổng số (%) min",
                        "unit": null,
                        "value": "1.0"
                    },
                    {
                        "name": "Lysine tổng số (%) min",
                        "unit": null,
                        "value": "1.8"
                    },
                    {
                        "name": "Ethoxy quin (ppm)",
                        "unit": null,
                        "value": "< 150"
                    }
                ],
                "package_type": "bao",
                "product_name": "THỨC ĂN THỦY SẢN MEKONG MK 831",
                "product_type": "THỨC ĂN HỖN HỢP CHO CÁ RÔ PHI, ĐIÊU HỒNG GIAI ĐOẠN TỪ 10 - 100g/con",
                "species": null,
                "uses": null,
                "variant_code": "MK 831"
            },
            "error_code": "NONE",
            "message": "Trích xuất thông tin sản phẩm thành công",
            "metadata": {
                "overall_confidence": 0.95,
                "review_warnings": []
            },
            "success": true
        },
        "totalImages": 2
    }
}
```

Giải thích nhanh:
- `feeding_guide`: hướng dẫn theo biến thể; `code` phải trùng với `variant_code`.
- `nutrition_facts`: thành phần dinh dưỡng (tên, giá trị, đơn vị).
- `package_type`: quy cách đóng gói (ví dụ: bao).
- `totalImages`: số ảnh xử lý trong request.
