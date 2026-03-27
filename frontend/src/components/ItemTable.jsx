import { Table } from "antd";
import { getItemColumns } from "./itemColumns";

const ItemTable = ({ items, loading, pagination, onPaginationChange }) => {
  const columns = getItemColumns({
    nameTitle: "Name",
    showPrice: true,
    showSorter: false,
    showThreshold: false,
    highlightLowStock: true,
    showLowStockStatus: true,
    stockHealthyColor: "#135200",
    priceFormatter: (value) => `Rs. ${Number(value).toFixed(2)}`,
    lowStockStatusLabel: "Low",
    healthyStatusLabel: "OK",
  });

  return (
    <Table
      rowKey="_id"
      columns={columns}
      dataSource={items}
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
                  total === 1 ? "item" : "items"
                }`,
              position: ["bottomRight"],
            }
          : false
      }
      scroll={{ x: "max-content" }}
      size="large"
    />
  );
};

export default ItemTable;
