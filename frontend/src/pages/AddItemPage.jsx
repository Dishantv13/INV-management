import { useEffect, useMemo } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, InputNumber, message, Select, Space } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageHeaderBar from "../components/PageHeaderBar";
import { ROUTE_URL } from "../enum/url";
import { useCreateItemMutation } from "../services/itemApi";
import { useGetActiveLocationsQuery } from "../services/locationApi";

const AddItemPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [createItem, { isLoading: isCreating }] = useCreateItemMutation();
  const {
    data: locationResponse = { data: [] },
    isLoading: isLocationsLoading,
  } = useGetActiveLocationsQuery();

  const locationOptions = useMemo(
    () =>
      locationResponse.data
        .filter((location) => location.status === "active")
        .map((location) => ({
          value: location._id,
          label: `${location.name} (${location.locationNo})`,
        })),
    [locationResponse.data],
  );

  useEffect(() => {
    const locationParam = searchParams.get("locations");
    if (locationParam) {
      const locationIds = locationParam.split(",").filter((id) => id);
      form.setFieldValue("locations", locationIds);
    }
  }, []);

  const handleLocationsChange = (selectedLocations) => {
    if (selectedLocations && selectedLocations.length > 0) {
      setSearchParams({ locations: selectedLocations.join(",") });
    } else {
      setSearchParams({});
    }
  };

  const handleSubmit = async (values) => {
    const {
      locations = [],
      name,
      sku,
      price,
      currentStock,
      lowStockThreshold,
    } = values;

    if (locations.length === 0) {
      messageApi.error("Please select at least one location");
      return;
    }

    const results = await Promise.allSettled(
      locations.map((location) =>
        createItem({
          name,
          sku,
          price,
          currentStock,
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
        `Item created in ${locations.length} location(s) successfully`,
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
        subtitle="Create one item and add it to multiple locations"
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
            currentStock: 0,
          }}
        >
          <Form.Item
            name="locations"
            label="Locations"
            rules={[
              {
                required: true,
                message: "Please select at least one location!",
              },
            ]}
          >
            <Select
              mode="multiple"
              showSearch
              allowClear
              loading={isLocationsLoading}
              placeholder="Search and select one or more locations"
              options={locationOptions}
              optionFilterProp="label"
              onChange={handleLocationsChange}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              notFoundContent="No locations found"
            />
          </Form.Item>

          <Space size="large" wrap>
            <Form.Item
              name="name"
              label="Item Name"
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
          </Space>

          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item
              name="currentStock"
              label="Stock Quantity"
              rules={[
                {
                  required: true,
                  message: "Please input the stock quantity!",
                },
              ]}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>

            <Form.Item
              name="price"
              label="Unit Price (Rs.)"
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
              style={{ flex: 1 }}
            >
              <InputNumber style={{ width: "100%" }} precision={2} min={0.01} />
            </Form.Item>

            <Form.Item
              name="lowStockThreshold"
              label="Low Stock Threshold"
              rules={[
                {
                  required: true,
                  message: "Please input threshold!",
                },
              ]}
              style={{ flex: 1 }}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          </div>

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
