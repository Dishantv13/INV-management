import { Empty, Table, Tag } from "antd";

const StockHistoryTable = ({ data, loading }) => {
  const columns = [
    {
      title: "Item",
      key: "item",
      render: (_, record) => {
        if (record?.itemId && typeof record.itemId === "object") {
          return `${record.itemId.name} (${record.itemId.sku})`;
        }
        return "-";
      },
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (value) =>
        value === "IN" ? <Tag color="success">IN</Tag> : <Tag color="error">OUT</Tag>,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Reference",
      dataIndex: "reference",
      key: "reference",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) => new Date(value).toLocaleString(),
    },
  ];

  if (!loading && data.length === 0) {
    return <Empty description="No stock movements found for this item" />;
  }

  return (
    <Table
      rowKey="_id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{ pageSize: 8 }}
    />
  );
};

export default StockHistoryTable;
