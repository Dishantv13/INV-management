import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";


const StockAdjustmentForm = ({
  locations,
  locationItems,
  loading,
  itemsLoading,
  onSubmit,
  onLocationChange,
  locationsLoading,
}) => {
  const [form] = Form.useForm();

  const option = [
    { value: "manual", label: "Manual" },
    { value: "sale", label: "Sale" },
    { value: "purchase", label: "Purchase" },
    { value: "adjustment", label: "Adjustment" },
  ];

  const submitAdjustments = async () => {
    try {
      const values = await form.validateFields();
      const isSuccess = await onSubmit(values);

      if (isSuccess) {
        form.setFieldValue("adjustments", [{ type: "IN" }]);
      }
    } catch {
      return null;
    }
  };

  const itemOptions = locationItems.map((item) => ({
    value: item.itemId,
    label: `${item.name} (${item.sku}) (Current: ${item.currentStock})`,
    currentStock: item.currentStock,
  }));

  const findCurrentStock = (itemId) => {
    const matched = locationItems.find((item) => item.itemId === itemId);
    return matched?.currentStock || 0;
  };

  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          reference: "manual",
          adjustments: [{ type: "IN" }],
        }}
      >
        <Form.Item
          name="locationId"
          label="Select Location"
          rules={[{ required: true, message: "Please select a location" }]}
        >
          <Select
            placeholder="Choose location"
            onChange={(value) => {
              form.setFieldValue("adjustments", [{ type: "IN" }]);
              onLocationChange?.(value);
            }}
            loading={locationsLoading}
            options={locations.map((location) => ({
              value: location._id,
              label: `${location.name} (${location.locationNo})`,
            }))}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Divider orientation="left">Item Adjustments</Divider>

        <Form.List
          name="adjustments"
          rules={[
            {
              validator: async (_, value) => {
                if (!value || value.length < 1) {
                  return Promise.reject(
                    new Error("Please add at least one item adjustment"),
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
                const rows = form.getFieldValue("adjustments") || [];
                const selectedByOtherRows = rows
                  .filter((_, rowIndex) => rowIndex !== index)
                  .map((row) => row?.itemId)
                  .filter(Boolean);
                const currentRowItem = rows?.[index]?.itemId;

                const rowItemOptions = itemOptions.filter(
                  (option) =>
                    option.value === currentRowItem ||
                    !selectedByOtherRows.includes(option.value),
                );

                const currentStock = findCurrentStock(currentRowItem);

                return (
                  <Space
                    key={key}
                    align="start"
                    style={{ display: "flex", marginBottom: 8 }}
                    wrap
                  >
                    <Form.Item
                      {...restField}
                      name={[field.name, "itemId"]}
                      label={index === 0 ? "Item" : ""}
                      rules={[
                        { required: true, message: "Please select item" },
                      ]}
                      style={{ minWidth: 320 }}
                    >
                      <Select
                        showSearch
                        optionFilterProp="label"
                        placeholder={
                          form.getFieldValue("locationId")
                            ? "Choose item"
                            : "Select location first"
                        }
                        disabled={!form.getFieldValue("locationId")}
                        loading={itemsLoading}
                        options={rowItemOptions}
                      />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[field.name, "type"]}
                      label={index === 0 ? "Type" : ""}
                      rules={[
                        { required: true, message: "Please select type" },
                      ]}
                      style={{ width: 140 }}
                    >
                      <Select
                        disabled={!form.getFieldValue("locationId")}
                        options={[
                          { value: "IN", label: "Add" },
                          { value: "OUT", label: "Remove" },
                        ]}
                      />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[field.name, "quantity"]}
                      label={index === 0 ? "New Stock Qty" : ""}
                      rules={[
                        {
                          required: true,
                          message: "Please enter stock quantity",
                        },
                        ({ getFieldValue }) => ({
                          validator: (_, value) => {
                            const itemId = getFieldValue([
                              "adjustments",
                              field.name,
                              "itemId",
                            ]);
                            const type = getFieldValue([
                              "adjustments",
                              field.name,
                              "type",
                            ]);
                            const latestStock = findCurrentStock(itemId);

                            if (!value || value <= 0) {
                              return Promise.reject(
                                new Error("Quantity must be greater than 0"),
                              );
                            }

                            if (type === "IN" && value <= latestStock) {
                              return Promise.reject(
                                new Error(
                                  `For Add, value must be greater than current (${latestStock})`,
                                ),
                              );
                            }

                            if (type === "OUT" && value >= latestStock) {
                              return Promise.reject(
                                new Error(
                                  `For Remove, value must be less than current (${latestStock})`,
                                ),
                              );
                            }

                            return Promise.resolve();
                          },
                        }),
                      ]}
                      style={{ width: 180 }}
                    >
                      <InputNumber
                        min={1}
                        style={{ width: "100%" }}
                        disabled={!form.getFieldValue("locationId")}
                      />
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
                onClick={() => add({ type: "IN" })}
                icon={<PlusOutlined />}
                disabled={!form.getFieldValue("locationId")}
              >
                Add Item Row
              </Button>
            </>
          )}
        </Form.List>

        <Form.Item
          name="reference"
          label="Adjustment Reference"
          rules={[
            { required: true, message: "Please select a reference type" },
          ]}
        >
          <Select placeholder="Select reference type" options={option} />
        </Form.Item>

        <Form.Item name="note" label="Note (Optional)">
          <Input.TextArea
            rows={3}
            placeholder="Optional note for these adjustments"
          />
        </Form.Item>

        <Space>
          <Button type="primary" onClick={submitAdjustments} loading={loading}>
            Apply Adjustments
          </Button>
        </Space>
      </Form>
    </Card>
  );
};

export default StockAdjustmentForm;
