import { Modal, Table, Empty } from "antd";

const ViewLocationItem = ({
  open,
  onCancel,
  title,
  columns,
  data = [],
  loading = false,
  pagination = null,
  onPaginationChange,
  width = 720,
  emptyText = "No data found",
  entityName = "items",
}) => {
  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={width}
    >
      {!loading && data.length === 0 ? (
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
                    `Showing ${range[0]}-${range[1]} of ${total} ${
                      total === 1 ? entityName.slice(0, -1) : entityName
                    }`,
                }
              : false
          }
        />
      )}
    </Modal>
  );
};

export default ViewLocationItem;
