import { Card, Table, Empty } from "antd";
import { lowStockColumns } from "./itemColumns";

const LowStockTable = ({
  items = [],
  loading,
  pagination,
  onPaginationChange,
}) => {
  return (
    <Card title="Critical Stock Watchlist" bordered={false}>
      <Table
        dataSource={items}
        columns={lowStockColumns}
        loading={loading}
        // rowKey="_id"
        locale={{
          emptyText: <Empty description="All stock levels are healthy!" />,
        }}
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
                `Showing ${range[0]}-${range[1]} of ${total} ${total === 1 ? "item" : "items"
                }`,
              position: ["bottomRight"],
            }
            : false
        }
      />
    </Card>
  );
};

export default LowStockTable;
