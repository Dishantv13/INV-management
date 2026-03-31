import { Modal, Form, Input } from "antd";

const LocationFormModal = ({ open, isLoading, onOk, onCancel, form }) => {
  return (
    <Modal
      title="Add New Location"
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={isLoading}
      okText="Create"
      cancelText="Cancel"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Location Name"
          name="name"
          rules={[{ required: true, message: "Please enter location name" }]}
        >
          <Input placeholder="e.g., Warehouse A" />
        </Form.Item>
        <Form.Item
          label="Location Number"
          name="locationNo"
          rules={[{ required: true, message: "Please enter location number" }]}
        >
          <Input placeholder="e.g., LOC-001" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LocationFormModal;
