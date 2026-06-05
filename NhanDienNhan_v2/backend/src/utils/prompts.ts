// export const pesticide_prompt = `
//         Dựa vào hình ảnh, hãy trích xuất thông tin sản phẩm. Hãy cố gắng trích xuất thông tin chính xác nhất có thể và đánh giá độ tin cậy của thông tin đó. Những field không chỉ rõ trong hình ảnh có thể để trống hoặc null.

//         Đối với các trường dữ liệu, nếu bạn cảm thấy không trích xuất được do ảnh mờ, chói sáng hoặc bố cục bảng biểu khó đọc, hãy thêm đường dẫn của trường đó vào mảng review_warnings trong metadata. Nếu bạn tự tin vào thông tin đã trích xuất, hãy bỏ qua, giữ mảng review_warnings trống.

//         Nếu ảnh:
//         - quá mờ
//         - không đọc được chữ
//         - không phải sản phẩm thuốc BVTV/phân bón
//         - không có nhãn

//         thì:
//         - success = false
//         - điền error_code phù hợp
//         - message mô tả lỗi cho UI
//         - các field còn lại để null hoặc mảng rỗng

//         Trả về JSON thoả mãn schema, chỉ trả về JSON, không giải thích gì thêm.
//         `;

// test prompt to get more detailed extraction of active ingredients
export const pesticide_prompt = `
Dựa vào hình ảnh, hãy trích xuất thông tin sản phẩm. 

QUY TẮC TRÍCH XUẤT (TUYỆT ĐỐI TUÂN THỦ):
1. TRÍCH XUẤT THÀNH PHẦN: Khi quét mục "THÀNH PHẦN", phải trích xuất ĐẦY ĐỦ tất cả các dòng xuất hiện. Có bao nhiêu gạch đầu dòng/thành phần thì phải tạo bấy nhiêu object trong mảng.
2. TRÍCH XUẤT NGÀY THÁNG (mfg_date, exp_date):
   - Khi tìm giá trị cho "Ngày sản xuất" (NSX) hoặc "Hạn sử dụng" (HSD), hãy chú ý rằng các ký tự số in phun (định dạng DD/MM/YY hoặc DD MM YY) có thể bị in lệch xuống dưới, lệch lên trên so với cụm chữ "NSX:" / "HSD:".
   - Hãy quét toàn bộ khu vực lân cận (bên phải, phía dưới, hoặc dòng kế tiếp ngay bên dưới chữ NSX) để tìm cụm số ngày tháng tương ứng.

QUY TẮC BÁO CÁO CẢNH BÁO (REVIEW WARNINGS):
- Đối với các trường dữ liệu, nếu bạn cảm thấy không trích xuất được do ảnh mờ, chói sáng, bị che khuất hoặc có watermark (chữ chìm) làm mất nét chữ, hãy để giá trị là null và thêm đường dẫn của trường đó vào mảng review_warnings trong metadata. Nếu tự tin, hãy giữ mảng review_warnings trống.
- Lỗi toàn cục (Ảnh nằm ngang, lóa sáng toàn bộ ảnh): Thêm một object vào review_warnings với "field" = null, "issue" = 'IMAGE_ROTATED' hoặc mã lỗi phù hợp, và giải thích trong "message".

XỬ LÝ ẢNH LỖI NẶNG:
Nếu ảnh quá mờ, không đọc được chữ, không phải sản phẩm thuốc BVTV/thủy sản hoặc không có nhãn:
- success = false
- điền error_code phù hợp
- message mô tả lỗi cho UI
- các field còn lại để null hoặc mảng rỗng

Trả về JSON thoả mãn schema, chỉ trả về JSON, không giải thích gì thêm.
`;

export const test_prompt = `
Is this pesticide label correctly oriented (text readable, not rotated/flipped)? Reply ONLY with JSON: {"degrees": 0, "confident": true} degrees = how many degrees CW to rotate to fix it (0/90/180/270).
`;

// Dựa vào hình ảnh, hãy trích toàn bộ thông tin được in trên nhãn. Hãy cố gắng trích xuất càng nhiều thông tin càng tốt.

//tight prompt
// export const pesticide_prompt = `
// Dựa vào hình ảnh, hãy trích xuất thông tin sản phẩm.

// QUY TẮC TRÍCH XUẤT (TUYỆT ĐỐI TUÂN THỦ):
// 1. CHỈ TRÍCH XUẤT NHỮNG GÌ NHÌN THẤY RÕ RÀNG TRÊN ẢNH. Tuyệt đối không tự ý suy luận, nội suy hoặc đoán dữ liệu bị thiếu dựa trên kiến thức bên ngoài hoặc các sản phẩm tương tự. (Ví dụ: Không được tự điền liều lượng sử dụng, thời gian cách ly, hay hàm lượng hoạt chất nếu phần nhãn đó bị mờ hoặc che lấp).

// QUY TẮC BÁO CÁO CẢNH BÁO (REVIEW WARNINGS):
// Bạn BẮT BUỘC phải thêm thông tin vào mảng \`review_warnings\` trong \`metadata\` nếu rơi vào các trường hợp sau:
// - BỊ CHE KHUẤT/RÁCH/GẠCH XÓA: Vùng dữ liệu cần trích xuất bị rách, gạch chéo, dính bẩn, lóa sáng tem phản quang hoặc bị nét bút bôi che khuất. (issue: "OBSCURED_DATA")
// - MỜ/CHÓI SÁNG/CHỮ QUÁ NHỎ: Chữ trên nhãn không thể đọc chắc chắn. (issue: "BLURRY_TEXT")
// Nếu gặp các tình huống này, hãy để giá trị của trường đó là null (ví dụ: \`active_ingredients\`, \`dosage\`, \`target_crops\` = null), và CHẮC CHẮN phải thêm đường dẫn của trường đó vào \`review_warnings\` kèm giải thích chi tiết lý do.

// XỬ LÝ ẢNH LỖI NẶNG:
// Nếu ảnh quá mờ toàn bộ, không đọc được bất kỳ chữ nào, không phải sản phẩm thuốc BVTV/phân bón, hoặc không có nhãn:
// - success = false
// - điền error_code phù hợp
// - message mô tả lỗi cho UI
// - các field còn lại để null hoặc mảng rỗng

// Trả về JSON thoả mãn schema, chỉ trả về JSON, không giải thích gì thêm.
// `;

export const fertilizer_prompt = `
Dựa vào hình ảnh, hãy trích xuất thông tin sản phẩm. 

QUY TẮC TRÍCH XUẤT (TUYỆT ĐỐI TUÂN THỦ):
1. TRÍCH XUẤT THÀNH PHẦN: Khi quét mục "THÀNH PHẦN", phải trích xuất ĐẦY ĐỦ tất cả các dòng xuất hiện. Có bao nhiêu gạch đầu dòng/thành phần thì phải tạo bấy nhiêu object trong mảng.
2. TRÍCH XUẤT NGÀY THÁNG (mfg_date, exp_date):
   - Khi tìm giá trị cho "Ngày sản xuất" (NSX) hoặc "Hạn sử dụng" (HSD), hãy chú ý rằng các ký tự số in phun (định dạng DD/MM/YY hoặc DD MM YY) có thể bị in lệch xuống dưới, lệch lên trên so với cụm chữ "NSX:" / "HSD:".
   - Hãy quét toàn bộ khu vực lân cận (bên phải, phía dưới, hoặc dòng kế tiếp ngay bên dưới chữ NSX) để tìm cụm số ngày tháng tương ứng.

QUY TẮC BÁO CÁO CẢNH BÁO (REVIEW WARNINGS):
- Đối với các trường dữ liệu, nếu bạn cảm thấy không trích xuất được do ảnh mờ, chói sáng, bị che khuất hoặc có watermark (chữ chìm) làm mất nét chữ, hãy để giá trị là null và thêm đường dẫn của trường đó vào mảng review_warnings trong metadata. Nếu tự tin, hãy giữ mảng review_warnings trống.
- Lỗi toàn cục (Ảnh nằm ngang, lóa sáng toàn bộ ảnh): Thêm một object vào review_warnings với "field" = null, "issue" = 'IMAGE_ROTATED' hoặc mã lỗi phù hợp, và giải thích trong "message".

XỬ LÝ ẢNH LỖI NẶNG:
Nếu ảnh quá mờ, không đọc được chữ, không phải sản phẩm phân bón hoặc không có nhãn:
- success = false
- điền error_code phù hợp
- message mô tả lỗi cho UI
- các field còn lại để null hoặc mảng rỗng

Trả về JSON thoả mãn schema, chỉ trả về JSON, không giải thích gì thêm.
`;

// export const feed_prompt = `
//         Dựa vào hình ảnh, hãy trích xuất thông tin sản phẩm. Hãy cố gắng trích xuất thông tin chính xác nhất có thể và đánh giá độ tin cậy của thông tin đó. Những field không chỉ rõ trong hình ảnh có thể để trống hoặc null.

//         variant_code là mã biến thể của sản phẩm, thường được đánh dấu tick vào nhãn, hoặc được in trực tiếp trên bao bì. Nếu không tìm thấy mã biến thể thì để null.

//         Đối với các trường dữ liệu, nếu bạn cảm thấy không trích xuất được do ảnh mờ, chói sáng hoặc bố cục bảng biểu khó đọc, hãy thêm đường dẫn của trường đó vào mảng review_warnings trong metadata. Nếu bạn tự tin vào thông tin đã trích xuất, hãy bỏ qua, giữ mảng review_warnings trống.

//         Nếu ảnh:
//         - quá mờ
//         - không đọc được chữ
//         - không phải sản phẩm thức ăn thủy sản
//         - không có nhãn

//         thì:
//         - success = false
//         - điền error_code phù hợp
//         - message mô tả lỗi cho UI
//         - các field còn lại để null hoặc mảng rỗng
//         Trả về JSON thoả mãn schema, chỉ trả về JSON, không giải thích gì thêm.
//         `;

// test prompt
export const feed_prompt = `
Dựa vào hình ảnh, hãy trích xuất thông tin sản phẩm.

QUY TẮC TRÍCH XUẤT (TUYỆT ĐỐI TUÂN THỦ):
1. CHỈ TRÍCH XUẤT NHỮNG GÌ NHÌN THẤY RÕ RÀNG TRÊN ẢNH. Tuyệt đối không tự ý suy luận, nội suy hoặc đoán dữ liệu dựa trên ngữ cảnh xung quanh (Ví dụ: Không được tự đoán thông số của một mã bị che dựa trên các mã liền kề).

2. XÁC ĐỊNH MÃ BIẾN THỂ (variant_code):

ƯU TIÊN theo thứ tự sau:

A. MÃ ĐƯỢC ĐÁNH DẤU CHỌN
Nếu có duy nhất một mã được đánh dấu bằng:
- dấu tick/check (✓, ✔, ☑),
- ô được tô,
- hoặc ký hiệu chọn rõ ràng,

=> BẮT BUỘC chọn mã đó làm variant_code.

Không cần dấu tick hoàn hảo.
Chỉ cần ký hiệu chọn xuất hiện rõ ràng cạnh đúng một mã.

Khi có dấu tick/check rõ ràng cạnh một mã variant:
- ưu tiên marker trực quan này hơn suy luận "không chắc chắn".
- Không được trả về AMBIGUOUS_VALUE nếu chỉ có duy nhất một mã được đánh dấu.
--------------------------------------------------

B. MÃ ĐƯỢC IN NỔI BẬT TRÊN BAO BÌ
Nếu không có dấu chọn nhưng có duy nhất một mã:
- được in lớn,
- khác biệt rõ ràng với phần mô tả còn lại,
- thường là mã sản phẩm như: MK 831, D20, F999, 8312...

=> dùng mã đó làm variant_code.

--------------------------------------------------

C. KHI NÀO ĐƯỢC PHÉP TRẢ VỀ null

Chỉ trả về null nếu:
- hoàn toàn không tìm thấy mã nào hợp lý,
- hoặc có nhiều mã cùng nổi bật / cùng được đánh dấu,
- hoặc chữ quá mờ không đọc chắc chắn.

3. TRÍCH XUẤT HƯỚNG DẪN CHO ĂN (feeding_guide): Chỉ lấy dữ liệu đúng của cột/dòng chứa mã variant_code. Không gộp chung mã khác.

QUY TẮC BÁO CÁO CẢNH BÁO (REVIEW WARNINGS):
Bạn BẮT BUỘC phải thêm thông tin vào mảng \`review_warnings\` trong \`metadata\` nếu rơi vào các trường hợp sau:
- BỊ CHE KHUẤT/GẠCH XÓA: Bảng dữ liệu hoặc dòng dữ liệu cần trích xuất bị gạch chéo, bôi màu, hoặc rách nhãn. (issue: "OBSCURED_DATA")
- MỜ/CHÓI SÁNG: Chữ không thể đọc chắc chắn. (issue: "BLURRY_TEXT")
Nếu gặp các tình huống này, hãy để giá trị của trường đó là null, và thêm tên trường (ví dụ: "nutrition_facts" hoặc "feeding_guide") vào \`review_warnings\` kèm giải thích chi tiết.
- Lỗi toàn cục (Ảnh nằm ngang, lóa sáng toàn bộ ảnh): Thêm một object vào review_warnings với "field" = null, "issue" = 'IMAGE_ROTATED' hoặc mã lỗi phù hợp, và giải thích trong "message".

XỬ LÝ ẢNH LỖI NẶNG:
Nếu ảnh quá mờ toàn bộ, không đọc được bất kỳ chữ nào, không có nhãn, hoặc sai danh mục:
- success = false
- error_code phù hợp
- message mô tả lỗi cho UI
- Các field còn lại để null.

Chỉ trả về JSON thoả mãn schema, không giải thích gì thêm.
`;
