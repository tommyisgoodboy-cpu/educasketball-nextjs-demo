export const ORDER_STEPS = [
  { value: "pending_payment", label: "待付款" },
  { value: "paid", label: "已付款" },
  { value: "shipped", label: "已出貨" },
];

export const CUSTOM_STEPS = [
  { value: "submitted", label: "已提交" },
  { value: "quoted", label: "已報價" },
  { value: "accepted", label: "已接受" },
  { value: "in_production", label: "製作中" },
  { value: "completed", label: "已完成" },
];

export const shortId = (id: string) => `#${id.slice(0, 8).toUpperCase()}`;
