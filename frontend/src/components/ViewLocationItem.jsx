import {
  Card,
  Table,
  Empty,
  Alert,
  Space,
  Button,
  Descriptions,
  Tag,
} from "antd";

const locationHeaderConfig = [
  {
    key: "name",
    label: "Location Name",
  },
  {
    key: "locationNo",
    label: "Location Number",
  },
  {
    key: "status",
    label: "Status",
    render: (value) => (
      <Tag color={value === "active" ? "success" : "error"}>
        {value || "unknown"}
      </Tag>
    ),
  },
  {
    key: "totalItems",
    label: "Total Items",
    render: (_, data) => data.totalItems,
  },
];

const itemHeaderConfig = [
  { key: "name", label: "Item Name" },
  { key: "sku", label: "SKU" },
  { key: "price", label: "Price", render: (val) => `Rs. ${Number(val || 0).toFixed(2)}` },
  { key: "currentStock", label: "Total Stock" },
  { key: "lowStockThreshold", label: "Low Stock Threshold" },
];

const ViewLocationItem = ({
  type = "location",
  headerData = {},
  headerConfig = type === "location" ? locationHeaderConfig : itemHeaderConfig,
  columns = [],
  data = [],
  loading = false,
  isHeaderError = false,
  isTableError = false,
  onRetry,
  pagination = null,
  onPaginationChange,
  emptyText = "No data found",
  entityName = "items",
}) => {
  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        {isHeaderError ? (
          <Alert type="error" showIcon message="Failed to load details" />
        ) : (
          <Descriptions>
            {headerConfig.map((item) => (
              <Descriptions.Item key={item.key} label={item.label}>
                {item.render
                  ? item.render(headerData[item.key], headerData)
                  : headerData[item.key] || "-"}
              </Descriptions.Item>
            ))}
          </Descriptions>
        )}
      </Card>

      <Card>
        {isTableError ? (
          <Space direction="vertical" size="middle">
            <Alert type="error" showIcon message="Failed to load data" />
            <Button onClick={onRetry}>Try Again</Button>
          </Space>
        ) : !loading && data.length === 0 ? (
          <Empty description={emptyText} />
        ) : (
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
                    `Showing ${range[0]}-${range[1]} of ${total} ${total === 1 ? entityName.slice(0, -1) : entityName
                    }`,
                }
                : false
            }
          />
        )}
      </Card>
    </>
  );
};

export default ViewLocationItem;
