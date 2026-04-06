import { Tag, Space, Typography } from "antd";

const { Text } = Typography;

export const getItemColumns = ({
  nameTitle = "Name",
  showName = true,
  showSku = true,
  showPrice = true,
  showSorter = false,
  priceFormatter = (value) => `Rs. ${Number(value).toFixed(2)}`,
  showThreshold = false,
  highlightLowStock = true,
  stockHealthyColor = "#135200",
  showLowStockStatus = false,
  showInventory = false,
  lowStockStatusLabel = "Low",
  healthyStatusLabel = "OK",
  showLocation = false,
  globalThreshold = null,
} = {}) => {
  const columns = []

  if (showName) {
    columns.push({
      title: nameTitle,
      dataIndex: "name",
      key: "name",
      ...(showSorter && {
        sorter: (a, b) => a.name.localeCompare(b.name),
      }),
    })
  }

  if (showSku) {
    columns.push({
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
    })
  }

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

  if (showInventory) {
    columns.push(
      {
        title: "Location Name",
        key: "locationName",
        render: (_, record) => record.locationId?.name || "-",
      },
      {
        title: "Location No",
        key: "locationNo",
        render: (_, record) => record.locationId?.locationNo || "-",
      }
    );
  }

  columns.push({
    title: "Current Stock",
    key: "currentStock",
    render: (_, record) => {
      const stock =
        record.currentStockAtLocation !== undefined
          ? record.currentStockAtLocation
          : record.currentStock;
      const threshold =
        record.lowStockThreshold ?? globalThreshold ?? 0;

      const isLow =
        record.isLowStock !== undefined
          ? record.isLowStock
          : stock <= threshold;

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
        const threshold =
          record.lowStockThreshold ?? globalThreshold ?? 0;

        const isLowStock =
          record.isLowStock ?? record.currentStock <= threshold;
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
  showName: true,
  showSku: true,
  showPrice: true,
  showSorter: false,
  showThreshold: true,
  highlightLowStock: true,
  showLowStockStatus: false,
  showLocation: true,
});

export const locationStockColumns = getItemColumns({
  nameTitle: "Item Name",
  showName: true,
  showSku: true,
  showPrice: false,
  showSorter: false,
  showThreshold: true,
  highlightLowStock: true,
  showLowStockStatus: true,
});

