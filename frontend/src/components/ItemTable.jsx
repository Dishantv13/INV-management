import { Table, Tag, Typography } from "antd";

const { Text } = Typography;

const ItemTable = ({ items, loading }) => {
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (value) => `Rs. ${Number(value).toFixed(2)}`,
    },
    {
      title: "Current Stock",
      dataIndex: "currentStock",
      key: "currentStock",
      render: (value, record) => {
        const isLowStock = value <= record.lowStockThreshold;
        return (
          <Text strong style={{ color: isLowStock ? "#cf1322" : "#135200" }}>
            {value}
          </Text>
        );
      },
    },
    {
      title: "Low Stock",
      key: "low-stock",
      render: (_, record) => {
        const isLowStock = record.currentStock <= record.lowStockThreshold;
        return isLowStock ? <Tag color="error">Low</Tag> : <Tag color="success">OK</Tag>;
      },
    },
  ];

  return (
    <Table
      rowKey="_id"
      columns={columns}
      dataSource={items}
      loading={loading}
      pagination={{ pageSize: 8 }}
    />
  );
};

export default ItemTable;
