import { Empty, Table, Tag } from "antd";

const StockHistoryTable = ({
  data,
  loading,
  pagination,
  onPaginationChange,
}) => {
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
      render: (value) => {
        if (value === "IN") {
          return <Tag color="success">IN</Tag>;
        } else {
          return <Tag color="error">OUT</Tag>;
        }
      },
    },
    {
      title: "Location",
      key: "location",
      render: (_, record) => {
        if (record?.locationId && typeof record.locationId === "object") {
          return `${record.locationId.name} (${record.locationId.locationNo})`;
        }
        return "-";
      },
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Current Stock",
      dataIndex: "currentStock",
      key: "currentStock",
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
      pagination={
        pagination
          ? {
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.totalItems,
              onChange: onPaginationChange,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ["5", "10", "20", "50"],
              showTotal: (total, range) =>
                `Showing ${range[0]}-${range[1]} of ${total} ${
                  total === 1 ? "record" : "records"
                }`,
              position: ["bottomRight"],
            }
          : false
      }
    />
  );
};

export default StockHistoryTable;
