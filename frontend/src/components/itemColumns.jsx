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
  showLocation = false,
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

  if (showLocation) {
    columns.push({
      title: "Location",
      key: "location",
      render: (_, record) => {
        if (record?.locationName) {
          return `${record.locationName} (${record.locationNo || "-"})`;
        }
        if (record?.location && typeof record.location === "object") {
          return `${record.location.name} (${record.location.locationNo || "-"})`;
        }
        return "-";
      },
    });
  }

  columns.push({
    title: "Current Stock",
    key: "currentStock",
    render: (_, record) => {
      const stock =
        record.currentStockAtLocation !== undefined
          ? record.currentStockAtLocation
          : record.currentStock;
      const isLow =
        record.isLowStock !== undefined
          ? record.isLowStock
          : stock <= record.lowStockThreshold;

      if (!highlightLowStock) {
        return <Tag color="error">{stock}</Tag>;
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

  if (showThreshold) {
    columns.push({
      title: "Threshold",
      dataIndex: "lowStockThreshold",
      key: "lowStockThreshold",
    });
  }

  if (showLowStockStatus) {
    columns.push({
      title: "Low Stock",
      key: "low-stock",
      render: (_, record) => {
        const isLowStock =
          record.isLowStock ?? record.currentStock <= record.lowStockThreshold;
        return isLowStock ? (
          <Tag color="error">{lowStockStatusLabel}</Tag>
        ) : (
          <Tag color="success">{healthyStatusLabel}</Tag>
        );
      },
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
  showLocation: true,
});

export const locationStockColumns = getItemColumns({
  nameTitle: "Item Name",
  showPrice: false,
  showSorter: false,
  showThreshold: true,
  highlightLowStock: true,
  showLowStockStatus: true,
});
