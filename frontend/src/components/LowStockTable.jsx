import { Card, Table, Empty } from "antd";
import { lowStockColumns } from "./lowstockColumn";

const LowStockTable = ({ items = [], loading }) => {
  const lowStockItems = items.filter(
    (item) => item.currentStock <= item.lowStockThreshold
  );

  return (
    <Card title="Critical Stock Watchlist" bordered={false}>
      {lowStockItems.length > 0 ? (
        <Table
          dataSource={lowStockItems}
          columns={lowStockColumns}
          loading={loading}
          rowKey="_id"
          pagination={false}
        />
      ) : (
        <Empty description="All stock levels are healthy!" />
      )}
    </Card>
  );
};

export default LowStockTable;