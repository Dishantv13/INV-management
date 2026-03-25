import { Button, Card, Form, Input, InputNumber, Select, Space } from "antd";
import { useEffect } from "react";

const StockAdjustmentForm = ({
  items,
  loading,
  onSubmit,
  selectedItemId,
  onItemChange,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (selectedItemId) {
      form.setFieldValue("itemId", selectedItemId);
    }
  }, [form, selectedItemId]);

  const submitWithType = async (type) => {
    try {
      const values = await form.validateFields();
      const isSuccess = await onSubmit({ ...values, type });

      if (isSuccess) {
        form.resetFields();
      }
    } catch {
      return null;
    }
  };

  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        initialValues={{ quantity: 1, reference: "manual" }}
      >
        <Form.Item
          name="itemId"
          label="Select Item"
          rules={[{ required: true, message: "Please select an item" }]}
        >
          <Select
            placeholder="Choose item"
            onChange={(value) => onItemChange?.(value)}
            options={items.map((item) => ({
              value: item._id,
              label: `${item.name} (${item.sku}) (Current: ${item.currentStock})`,
            }))}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Quantity"
          rules={[
            { required: true, message: "Please enter quantity" },
            {
              validator: (_, value) => {
                if (!value || value <= 0) {
                  return Promise.reject(new Error("Quantity must be greater than 0"));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="reference"
          label="Adjustment Reference"
          rules={[{ required: true, message: "Please select a reference type" }]}
        >
          <Select
            placeholder="Select reference type"
            options={[
              { value: "manual", label: "Manual" },
              { value: "sale", label: "Sale" },
              { value: "purchase", label: "Purchase" },
              { value: "adjustment", label: "Adjustment" },
            ]}
          />
        </Form.Item>

        <Form.Item name="note" label="Note (Optional)">
          <Input.TextArea rows={3} placeholder="Optional note for this adjustment" />
        </Form.Item>

        <Space>
          <Button
            type="primary"
            onClick={() => submitWithType("IN")}
            loading={loading}
            disabled={loading}
          >
            Add Stock
          </Button>
          <Button
            danger
            onClick={() => submitWithType("OUT")}
            loading={loading}
            disabled={loading}
          >
            Remove Stock
          </Button>
        </Space>
      </Form>
    </Card>
  );
};

export default StockAdjustmentForm;
