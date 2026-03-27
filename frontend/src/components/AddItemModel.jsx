import { Modal, Form, Input, InputNumber } from "antd";

const AddItemModal = ({ open, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    onSubmit(values);
  };

  return (
    <Modal
      title="Create New Inventory Item"
      open={open}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={form.submit}
      confirmLoading={loading}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ lowStockThreshold: 5 }}
      >
        <Form.Item
          name="name"
          label="Item Name"
          rules={[{ required: true, message: "Please input the item name!" }]}
        >
          <Input placeholder="e.g. MacBook Pro M3" />
        </Form.Item>

        <Form.Item
          name="sku"
          label="SKU ID"
          rules={[
            { required: true, message: "Please input the SKU code!" },
            { min: 2, message: "SKU must be at least 2 characters" },
          ]}
        >
          <Input placeholder="e.g. APPLE-MBP-M3" />
        </Form.Item>

        <div style={{ display: "flex", gap: 16 }}>
          <Form.Item
            name="price"
            label="Unit Price (₹)"
            rules={[
              { required: true, message: "Please input unit price!" },
              {
                validator: (_, value) => {
                  if (!value || value <= 0) {
                    return Promise.reject(
                      new Error("Price must be greater than 0"),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            style={{ flex: 1 }}
          >
            <InputNumber style={{ width: "100%" }} precision={2} min={0.01} />
          </Form.Item>

          <Form.Item
            name="lowStockThreshold"
            label="Low Stock Threshold"
            rules={[{ required: true, message: "Please input threshold!" }]}
            style={{ flex: 1 }}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default AddItemModal;
