import { Tag, Space, Typography } from "antd";

const { Text } = Typography;

export const getItemColumns = ({
  showPrice = true,
  showSorter = false,
  highlightLowStock = true,
}) => {
  const columns = [
    {
      title: "Item Name",
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
      render: (price) => `₹ ${price.toFixed(2)}`,
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

  columns.push({
    title: "Threshold",
    dataIndex: "lowStockThreshold",
    key: "lowStockThreshold",
  });

  return columns;
};

export const lowStockColumns = getItemColumns({
  showPrice: true,
  showSorter: false,
  highlightLowStock: true,
});