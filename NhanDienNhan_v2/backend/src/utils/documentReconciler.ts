/**
 * Helper to reconcile document values and automatically add warnings in case of mathematical mismatches.
 * Handles both "invoice" (financial details) and "delivery_note" (weight and bag quantity details).
 */

export function reconcileDocumentMath(response: any): any {
  if (!response || !response.success || !response.data) {
    return response;
  }

  const { documents } = response.data;
  if (!Array.isArray(documents)) {
    return response;
  }

  // Ensure metadata and review_warnings structure exist
  if (!response.metadata) {
    response.metadata = { overall_confidence: 1.0, review_warnings: [] };
  } else if (!Array.isArray(response.metadata.review_warnings)) {
    response.metadata.review_warnings = [];
  }

  documents.forEach((doc: any, docIndex: number) => {
    if (!doc || !doc.document_type) return;

    if (doc.document_type === "invoice") {
      let calculatedGrandTotal = 0;
      let hasValidItems = false;
      const items = doc.items || [];

      items.forEach((item: any, itemIndex: number) => {
        // Reconcile each row: quantity * unit_price === total_amount
        if (item.quantity !== null && item.unit_price !== null) {
          const expectedTotal = item.quantity * item.unit_price;
          if (item.total_amount !== null) {
            // Epsilon check for floating-point calculations
            if (Math.abs(expectedTotal - item.total_amount) > 0.01) {
              response.metadata.review_warnings.push({
                field: `documents.${docIndex}.items.${itemIndex}.quantity`,
                issue: "MATH_MISMATCH",
                message: `Hệ thống tự động phát hiện ở chứng từ số ${docIndex + 1}: dòng số ${itemIndex + 1} có số lượng ${item.quantity} x đơn giá ${item.unit_price} (= ${expectedTotal}) không khớp với thành tiền ${item.total_amount}`,
              });
            }
          }
        }

        if (item.total_amount !== null) {
          calculatedGrandTotal += item.total_amount;
          hasValidItems = true;
        }
      });

      // Reconcile grand total: sum of total_amount === grand_total
      if (hasValidItems && doc.grand_total !== null) {
        if (Math.abs(calculatedGrandTotal - doc.grand_total) > 0.01) {
          response.metadata.review_warnings.push({
            field: `documents.${docIndex}.grand_total`,
            issue: "MATH_MISMATCH",
            message: `Hệ thống tự động phát hiện ở chứng từ số ${docIndex + 1}: tổng thành tiền của các dòng (= ${calculatedGrandTotal}) không khớp với tổng tiền thanh toán ${doc.grand_total}`,
          });
        }
      }
    } else if (doc.document_type === "delivery_note") {
      let calculatedTotalBags = 0;
      let calculatedTotalWeight = 0;
      let hasValidBags = false;
      let hasValidWeight = false;
      const items = doc.items || [];

      items.forEach((item: any, itemIndex: number) => {
        // Reconcile each row: net_content * bag_count === total_weight
        if (item.net_content !== null && item.bag_count !== null) {
          const expectedWeight = item.net_content * item.bag_count;
          if (item.total_weight !== null) {
            if (Math.abs(expectedWeight - item.total_weight) > 0.01) {
              response.metadata.review_warnings.push({
                field: `documents.${docIndex}.items.${itemIndex}.total_weight`,
                issue: "MATH_MISMATCH",
                message: `Hệ thống tự động phát hiện ở chứng từ số ${docIndex + 1}: dòng số ${itemIndex + 1} có khối lượng 1 bao ${item.net_content} x số bao ${item.bag_count} (= ${expectedWeight}) không khớp với tổng khối lượng dòng ${item.total_weight}`,
              });
            }
          }
        }

        if (item.bag_count !== null) {
          calculatedTotalBags += item.bag_count;
          hasValidBags = true;
        }

        if (item.total_weight !== null) {
          calculatedTotalWeight += item.total_weight;
          hasValidWeight = true;
        }
      });

      // Reconcile total bags: sum of bag_count === total_bags
      if (hasValidBags && doc.total_bags !== null) {
        if (calculatedTotalBags !== doc.total_bags) {
          response.metadata.review_warnings.push({
            field: `documents.${docIndex}.total_bags`,
            issue: "MATH_MISMATCH",
            message: `Hệ thống tự động phát hiện ở chứng từ số ${docIndex + 1}: tổng số bao các dòng (= ${calculatedTotalBags}) không khớp với tổng số bao của phiếu ${doc.total_bags}`,
          });
        }
      }

      // Reconcile total weight kg: sum of total_weight === total_weight_kg
      if (hasValidWeight && doc.total_weight_kg !== null) {
        if (Math.abs(calculatedTotalWeight - doc.total_weight_kg) > 0.01) {
          response.metadata.review_warnings.push({
            field: `documents.${docIndex}.total_weight_kg`,
            issue: "MATH_MISMATCH",
            message: `Hệ thống tự động phát hiện ở chứng từ số ${docIndex + 1}: tổng khối lượng các dòng (= ${calculatedTotalWeight}) không khớp với tổng khối lượng của phiếu ${doc.total_weight_kg}`,
          });
        }
      }
    }
  });

  return response;
}
