import { useCallback, useMemo } from "react";
import { ArrowLeftOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Divider, Form, Input, InputNumber, message, Select, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import PageHeaderBar from "../components/PageHeaderBar";
import { ROUTE_URL } from "../enum/url";
import { useCreateItemMutation } from "../services/itemApi";
import { useGetActiveLocationsQuery } from "../services/locationApi";

const { Title } = Typography;

const AddItemPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [createItem, { isLoading: isCreating }] = useCreateItemMutation();
  const {
    data: locationResponse = { data: [] },
    isLoading: isLocationsLoading,
  } = useGetActiveLocationsQuery();

  const allLocationOptions = useMemo(
    () =>
      locationResponse.data
        .filter((location) => location.status === "active")
        .map((location) => ({
          value: location._id,
          label: `${location.name} (${location.locationNo})`,
        })),
    [locationResponse.data],
  );

  const getAvailableOptions = (currentIndex) => {
    const locationRows = form.getFieldValue("locationRows") || [];
    const selectedIds = locationRows
      .map((row, idx) => (idx !== currentIndex ? row?.location : null))
      .filter(Boolean);
    return allLocationOptions.filter((opt) => !selectedIds.includes(opt.value));
  };

  const locationRows = Form.useWatch("locationRows", form) || [];
  const allLocationsUsed = useMemo(
    () =>
      allLocationOptions.length > 0 &&
      locationRows.length >= allLocationOptions.length,
    [allLocationOptions.length, locationRows.length],
  );

  const handleLocationChange = useCallback(() => {
    form.validateFields();
  }, [form]);

  const handleSubmit = async (values) => {
    const { locationRows = [], name, sku, price, lowStockThreshold } = values;

    if (locationRows.length === 0) {
      messageApi.error("Please add at least one location");
      return;
    }

    const results = await Promise.allSettled(
      locationRows.map(({ location, quantity }) =>
        createItem({
          name,
          sku,
          price,
          currentStock: quantity,
          lowStockThreshold,
          location,
        }).unwrap(),
      ),
    );

    const successCount = results.filter(
      (result) => result.status === "fulfilled",
    ).length;
    const failedResults = results.filter(
      (result) => result.status === "rejected",
    );
    const failedCount = failedResults.length;

    if (failedCount === 0) {
      messageApi.success(
        `Item created in ${locationRows.length} location(s) successfully`,
      );
      navigate(ROUTE_URL.ITEMS);
      return;
    }

    if (successCount > 0) {
      messageApi.warning(
        `${successCount} location(s) succeeded, ${failedCount} failed. Please review duplicate SKUs or invalid values and try again.`,
      );
      return;
    }

    const firstError = failedResults[0]?.reason;
    messageApi.error(firstError?.data?.message || "Failed to create item");
  };

  return (
    <div>
      {contextHolder}
      <PageHeaderBar
        title="Add Item"
        subtitle="Create one item and add it to multiple locations with individual quantities"
        rightNode={
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTE_URL.ITEMS)}
          >
            Back to Items
          </Button>
        }
      />

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            lowStockThreshold: 5,
            locationRows: [{ location: undefined, quantity: 0 }],
          }}
        >
          <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>
            Item Details
          </Title>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Form.Item
              name="name"
              label="Item Name"
              style={{ flex: "1 1 200px" }}
              rules={[
                {
                  required: true,
                  message: "Please input the item name!",
                },
              ]}
            >
              <Input placeholder="e.g. MacBook Pro M3" />
            </Form.Item>

            <Form.Item
              name="sku"
              label="SKU ID"
              style={{ flex: "1 1 160px" }}
              rules={[
                {
                  required: true,
                  message: "Please input the SKU code!",
                },
                {
                  min: 2,
                  message: "SKU must be at least 2 characters",
                },
              ]}
            >
              <Input placeholder="e.g. APPLE-MBP-M3" />
            </Form.Item>

            <Form.Item
              name="price"
              label="Unit Price (Rs.)"
              style={{ flex: "1 1 140px" }}
              rules={[
                {
                  required: true,
                  message: "Please input unit price!",
                },
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
            >
              <InputNumber style={{ width: "100%" }} precision={2} min={0.01} />
            </Form.Item>

            <Form.Item
              name="lowStockThreshold"
              label="Low Stock Threshold"
              style={{ flex: "1 1 140px" }}
              rules={[
                {
                  required: true,
                  message: "Please input threshold!",
                },
              ]}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          </div>

          <Divider />

          <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>
            Locations & Quantities
          </Title>

          <Form.List
            name="locationRows"
            rules={[
              {
                validator: async (_, rows) => {
                  if (!rows || rows.length === 0) {
                    return Promise.reject(
                      new Error("Please add at least one location"),
                    );
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, name: fieldName, ...restField }, index) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      marginBottom: 4,
                    }}
                  >
                    <Form.Item
                      {...restField}
                      name={[fieldName, "location"]}
                      label={index === 0 ? "Location" : ""}
                      style={{ flex: 2, minWidth: 200 }}
                      rules={[
                        {
                          required: true,
                          message: "Please select a location",
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        allowClear
                        loading={isLocationsLoading}
                        placeholder="Select a location"
                        options={getAvailableOptions(index)}
                        optionFilterProp="label"
                        filterOption={(input, option) =>
                          (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        notFoundContent="No locations available"
                        onChange={handleLocationChange}
                      />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[fieldName, "quantity"]}
                      label={index === 0 ? "Quantity" : ""}
                      style={{ flex: 1, minWidth: 100 }}
                      rules={[
                        {
                          required: true,
                          message: "Required",
                        },
                      ]}
                    >
                      <InputNumber style={{ width: "100%" }} min={0} />
                    </Form.Item>

                    <Form.Item label={index === 0 ? " " : ""} colon={false}>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(fieldName)}
                        disabled={fields.length === 1}
                      />
                    </Form.Item>
                  </div>
                ))}

                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add({ location: undefined, quantity: 0 })}
                    icon={<PlusOutlined />}
                    disabled={allLocationsUsed}
                  >
                    Add Location
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>

          <Space>
            <Button onClick={() => navigate(ROUTE_URL.ITEMS)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isCreating}>
              Create Item In Selected Locations
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default AddItemPage;
