import { Form, Input, InputNumber, Button, Divider, Space, Select } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const   ItemForm = ({
  form,
  onFinish,
  isLoading,
  isLocationsLoading,
  getAvailableLocations,
  onCancel,
  initialValues,
  submitText = "Submit",
  disabledSku = false,
  isUpdate = false,
}) => {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <div style={{ display: "flex", gap: 16 }}>
        <Form.Item
          name="name"
          label="Item Name"
          rules={[{ required: true, message: "Please input the item name!" }]}
          style={{ flex: 1 }}
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
          style={{ flex: 1 }}
        >
          <Input placeholder="e.g. APPLE-MBP-M3" disabled={disabledSku} />
        </Form.Item>

        <Form.Item
          name="price"
          label="Unit Price (Rs.)"
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

      <Divider orientation="left">
        {isUpdate ? "Add Stock to New Locations" : "Initial Stock by Location"}
      </Divider>

      <Form.List
        name="initialStocks"
        rules={[
          {
            validator: async (_, value) => {
              if (!isUpdate && (!value || value.length < 1)) {
                return Promise.reject(
                  new Error("Please add at least one location stock row"),
                );
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        {(fields, { add, remove }, { errors }) => (
          <>
            {fields.map((field, index) => {
              const { key, ...restField } = field;
              const initialStocks = form.getFieldValue("initialStocks") || [];
              const options = getAvailableLocations(initialStocks, index);

              return (
                <Space
                  key={key}
                  align="start"
                  style={{ display: "flex", marginBottom: 8 }}
                  wrap
                >
                  <Form.Item
                    {...restField}
                    name={[field.name, "location"]}
                    label={index === 0 ? "Location" : ""}
                    rules={[
                      {
                        required: true,
                        message: "Please select a location",
                      },
                    ]}
                    style={{ minWidth: 320 }}
                  >
                    <Select
                      showSearch
                      loading={isLocationsLoading}
                      placeholder="Select location"
                      options={options}
                      optionFilterProp="label"
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[field.name, "quantity"]}
                    label={index === 0 ? "Quantity" : ""}
                    rules={[
                      {
                        required: true,
                        message: "Please enter quantity",
                      },
                      {
                        validator: (_, value) => {
                          if (!value || value <= 0) {
                            return Promise.reject(
                              new Error("Quantity must be greater than 0"),
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                    style={{ width: 160 }}
                  >
                    <InputNumber min={1} style={{ width: "100%" }} />
                  </Form.Item>

                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    style={{ marginTop: index === 0 ? 29 : 0 }}
                    onClick={() => remove(field.name)}
                  >
                    Remove
                  </Button>
                </Space>
              );
            })}

            <Form.ErrorList errors={errors} />

            <Button
              type="dashed"
              onClick={() => add({ quantity: 1 })}
              icon={<PlusOutlined />}
            >
              Add Location
            </Button>
          </>
        )}
      </Form.List>

      <Space>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" htmlType="submit" loading={isLoading}>
          {submitText}
        </Button>
      </Space>
    </Form>
  );
};

export default ItemForm;
