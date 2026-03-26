import { Tag, Space, Typography } from "antd";

const { Text } = Typography;

export const getItemColumns = ({
  nameTitle = "Name",
  showPrice = true,
  showSorter = false,
  priceFormatter = (value) => `Rs. ${Number(value).toFixed(2)}`,
  showThreshold = false,
  highlightLowStock = true,
  stockHealthyColor = "#135200",
  showLowStockStatus = false,
  lowStockStatusLabel = "Low",
  healthyStatusLabel = "OK",
} = {}) => {
  const columns = [
    {
      title: nameTitle,
      dataIndex: "name",
      key: "name",
      ...(showSorter && {
        sorter: (a, b) => a.name.localeCompare(b.name),
      }),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
    },
  ];

  if (showPrice) {
    columns.push({
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => priceFormatter(price),
    });
  }

  columns.push({
    title: "Current Stock",
    dataIndex: "currentStock",
    key: "currentStock",
    render: (stock, record) => {
      const isLow = stock <= record.lowStockThreshold;

      if (!highlightLowStock) {
        return <Tag color="red">{stock}</Tag>;
      }

      if (showLowStockStatus) {
        return (
          <Text strong style={{ color: isLow ? "#cf1322" : stockHealthyColor }}>
            {stock}
          </Text>
        );
      }

      return (
        <Space>
          <Text strong style={{ color: isLow ? "#cf1322" : "inherit" }}>
            {stock}
          </Text>
          {isLow && <Tag color="error">Low Stock</Tag>}
        </Space>
      );
    },
  });

  if (showLowStockStatus) {
    columns.push({
      title: "Low Stock",
      key: "low-stock",
      render: (_, record) => {
        const isLowStock = record.currentStock <= record.lowStockThreshold;
        return isLowStock ? (
          <Tag color="error">{lowStockStatusLabel}</Tag>
        ) : (
          <Tag color="success">{healthyStatusLabel}</Tag>
        );
      },
    });
  }

  if (showThreshold) {
    columns.push({
      title: "Threshold",
      dataIndex: "lowStockThreshold",
      key: "lowStockThreshold",
    });
  }

  return columns;
};

export const lowStockColumns = getItemColumns({
  nameTitle: "Item Name",
  showPrice: true,
  showSorter: false,
  showThreshold: true,
  highlightLowStock: true,
  showLowStockStatus: false,
});