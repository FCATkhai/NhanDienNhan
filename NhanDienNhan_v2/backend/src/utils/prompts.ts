export const pesticide_prompt = `
        Dựa vào hình ảnh, hãy trích xuất thông tin sản phẩm. Hãy cố gắng trích xuất thông tin chính xác nhất có thể và đánh giá độ tin cậy của thông tin đó. Những field không chỉ rõ trong hình ảnh có thể để trống hoặc null.

        Nếu ảnh:
        - quá mờ
        - không đọc được chữ
        - không phải sản phẩm thuốc BVTV/phân bón
        - không có nhãn

        thì:
        - success = false
        - điền error_code phù hợp
        - message mô tả lỗi cho UI
        - các field còn lại để null hoặc mảng rỗng

        Trả về JSON thoả mãn schema, chỉ trả về JSON, không giải thích gì thêm.
        `;

export const feed_prompt = `
        Dựa vào hình ảnh, hãy trích xuất thông tin sản phẩm. Hãy cố gắng trích xuất thông tin chính xác nhất có thể và đánh giá độ tin cậy của thông tin đó. Những field không chỉ rõ trong hình ảnh có thể để trống hoặc null.
        
        variant_code là mã biến thể của sản phẩm, thường được đánh dấu tick vào nhãn, hoặc được in trực tiếp trên bao bì. Nếu không tìm thấy mã biến thể thì để null.

        Nếu ảnh:
        - quá mờ
        - không đọc được chữ
        - không phải sản phẩm thức ăn thủy sản
        - không có nhãn

        thì:
        - success = false
        - điền error_code phù hợp
        - message mô tả lỗi cho UI
        - các field còn lại để null hoặc mảng rỗng
        Trả về JSON thoả mãn schema, chỉ trả về JSON, không giải thích gì thêm.
        `;
