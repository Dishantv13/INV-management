import {
  Card,
  Table,
  Alert,
  Descriptions,
  Tag,
} from "antd";

const itemHeaderConfig = [
  { key: "name", label: "Item Name" },
  { key: "sku", label: "SKU" },
  { key: "price", label: "Price", render: (val) => `Rs. ${Number(val || 0).toFixed(2)}` },
  { key: "openingStock", label: "Opening Stock" },
  { key: "closingStock", label: "Closing Stock" },
  { key: "currentStock", label: "Total Stock" },
];

const StockHistoryTable = ({
  type = "default",
  historyId = false,
  showItem = false,
  currentStock = false,
  selectedItem,
  data,
  loading,
  pagination,
  onPaginationChange,
}) => {
  let columns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (value) => (
        <Tag color={value === "IN" ? "success" : "error"}>
          {value}
        </Tag>
      ),
    },
    {
      title: "Location",
      key: "location",
      render: (_, record) =>
        record?.locationId
          ? `${record.locationId.name} (${record.locationId.locationNo})`
          : "-",
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

  if (showItem) {
    columns.unshift({
      title: "Item",
      key: "item",
      render: (_, record) =>
        record?.itemId
          ? `${record.itemId.name} (${record.itemId.sku})`
          : "-",
    });
  }

  if (historyId) {
    columns.unshift({
      title: "History ID",
      dataIndex: "movementDisplayId",
      key: "movementDisplayId",
    });
  }

  if (currentStock) {
    columns.splice(4, 0, {
      title: "Current Stock",
      dataIndex: "currentStock",
      key: "currentStock",
    });
  }

  return (
    <>
      {type === "report" ? (
        selectedItem ? (
          <Card style={{ marginBottom: 16 }}>
            <Descriptions>
              {itemHeaderConfig.map((item) => (
                <Descriptions.Item key={item.key} label={item.label}>
                  {item.render
                    ? item.render(selectedItem[item.key], selectedItem)
                    : selectedItem[item.key] ?? "-"}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </Card>
        ) : (
          <Card style={{ marginBottom: 16 }}>
            <Alert type="error" showIcon message="Failed to load details" />
          </Card>
        )
      ) : null}


      <Card>
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
                  `Showing ${range[0]}-${range[1]} of ${total} ${total === 1 ? "record" : "records"
                  }`,
                position: ["bottomRight"],
              }
              : false
          }
        />
      </Card>
    </>
  );
};

export default StockHistoryTable;