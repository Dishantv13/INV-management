import { Table, Switch, Button, Space, Modal, message } from "antd";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";

const LocationTable = ({
  data,
  loading,
  pagination,
  onPaginationChange,
  onStatusChange,
  onDelete,
  onViewItems,
  statusLoading,
  deleteLoading,
}) => {
  const handleDelete = (locationId) => {
    Modal.confirm({
      title: "Delete Location",
      content: "Are you sure you want to delete this location?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          await onDelete(locationId);
          message.success("Location deleted successfully");
        } catch (error) {
          message.error(error?.data?.message || "Failed to delete location");
        }
      },
    });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "30%",
    },
    {
      title: "Location Number",
      dataIndex: "locationNo",
      key: "locationNo",
      width: "25%",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "20%",
      render: (status, record) => (
        <Switch
          checked={status === "active"}
          onChange={() => onStatusChange(record._id, status)}
          loading={statusLoading}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "25%",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onViewItems?.(record)}
          >
            View Items
          </Button>
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
            loading={deleteLoading}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="_id"
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
                  total === 1 ? "location" : "locations"
                }`,
            }
          : false
      }
    />
  );
};

export default LocationTable;
