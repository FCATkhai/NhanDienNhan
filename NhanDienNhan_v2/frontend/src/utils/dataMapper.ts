const formTypeMap: Record<string, string> = {
  bot: "Bột",
  nuoc: "Nước",
  vien: "Viên",
  khac: "Khác",
};

export function getFormTypeLabel(formType: string) {
  return formTypeMap[formType.toLocaleLowerCase()] || "Không xác định";
}

const netContentCategoryMap = {
  "Khối lượng tịnh": ["kg", "g", "mg"],
  "Thể tích thực": ["lít", "lit", "l", "ml"],
};

export function getNetContentTitle(unit: string) {
  const normalized = unit.trim().toLowerCase();

  return (
    Object.entries(netContentCategoryMap).find(([_, units]) =>
      units.includes(normalized),
    )?.[0] || "Dung lượng"
  );
}
