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
  items,
  selectedItemDetails,
  locations,
  loading,
  itemFetching,
  itemsLoading,
  onSubmit,
  onItemChange,
}) => {
  const [form] = Form.useForm();

  const referenceOptions = [
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
        form.resetFields();
      }
    } catch {
      return null;
    }
  };

  const handleItemSelect = (itemId) => {
    onItemChange?.(itemId);
    form.setFieldValue("adjustments", [{ type: "IN" }]);
  };

  const findCurrentStock = (locationId) => {
    if (!selectedItemDetails || !selectedItemDetails.inventory) return 0;
    const entry = selectedItemDetails.inventory.find(
      (inv) => String(inv.locationId) === String(locationId),
    );
    return entry?.currentStock || 0;
  };

  const adjustments = Form.useWatch("adjustments", form) || [];

  const locationOptions = locations.map((loc) => ({
    value: loc._id,
    label: `${loc.name} (${loc.locationNo})`,
  }));

  const availableLocationIds = (selectedItemDetails?.inventory || []).map((inv) =>
    String(inv.locationId),
  );

  const filteredLocationOptions = locationOptions.filter((opt) =>
    availableLocationIds.includes(String(opt.value)),
  );

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
          name="itemId"
          label="Select Item"
          rules={[{ required: true, message: "Please select an item" }]}
        >
          <Select
            placeholder="Choose item to adjust"
            onChange={handleItemSelect}
            loading={itemsLoading}
            showSearch
            optionFilterProp="label"
            options={items.map((item) => ({
              value: item._id,
              label: `${item.name} (${item.sku})`,
            }))}
          />
        </Form.Item>

        <Divider orientation="left">Location Adjustments</Divider>

        <Form.List
          name="adjustments"
          rules={[
            {
              validator: async (_, value) => {
                if (!value || value.length < 1) {
                  return Promise.reject(
                    new Error("Please add at least one location adjustment"),
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
                const currentRow = adjustments[index] || {};
                const currentLocationId = currentRow.locationId;

                const selectedByOtherRows = adjustments
                  .filter((_, rowIndex) => rowIndex !== index)
                  .map((row) => row?.locationId)
                  .filter(Boolean);

                const finalLocationOptions = filteredLocationOptions.filter(
                  (opt) =>
                    opt.value === currentLocationId ||
                    !selectedByOtherRows.includes(opt.value),
                );

                const currentStock = findCurrentStock(currentLocationId);

                return (
                  <Space
                    key={key}
                    align="start"
                    style={{ display: "flex", marginBottom: 8 }}
                    wrap
                  >
                    <Form.Item
                      {...restField}
                      name={[field.name, "locationId"]}
                      label={index === 0 ? "Location" : ""}
                      rules={[
                        { required: true, message: "Please select location" },
                      ]}
                      style={{ minWidth: 320 }}
                    >
                      <Select
                        showSearch
                        optionFilterProp="label"
                        placeholder="Choose location"
                        loading={itemFetching}
                        options={finalLocationOptions}
                      />
                    </Form.Item>

                    <Form.Item
                      label={index === 0 ? "Current Stock" : ""}
                      style={{ width: 120 }}
                    >
                      <InputNumber
                        value={currentStock}
                        readOnly
                        disabled
                        style={{
                          width: "100%",
                          color: "rgba(0, 0, 0, 0.85)",
                          backgroundColor: "#f5f5f5",
                        }}
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
                          message: "Please enter quantity",
                        },
                        ({ getFieldValue }) => ({
                          validator: (_, value) => {
                            const locationId = getFieldValue([
                              "adjustments",
                              field.name,
                              "locationId",
                            ]);
                            const type = getFieldValue([
                              "adjustments",
                              field.name,
                              "type",
                            ]);
                            const latestStock = findCurrentStock(locationId);

                            if (value === undefined || value === null) {
                              return Promise.resolve();
                            }

                            if (value <= 0) {
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
                      <InputNumber min={0} style={{ width: "100%" }} />
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
                disabled={!form.getFieldValue("itemId")}
              >
                Add Location Row
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
          <Select
            placeholder="Select reference type"
            options={referenceOptions}
          />
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
