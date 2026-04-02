import { useMemo } from "react";
import {
  ArrowLeftOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Form,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import PageHeaderBar from "../components/PageHeaderBar";
import ItemForm from "../components/ItemForm";
import { ROUTE_URL } from "../enum/url";
import { useCreateItemMutation } from "../services/itemApi";
import { useGetActiveLocationsQuery } from "../services/locationApi";

const AddItemPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

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

  const getAvailableLocations = (allRows = [], currentIndex) => {
    const selectedByOtherRows = allRows
      .filter((_, index) => index !== currentIndex)
      .map((row) => row?.location)
      .filter(Boolean);

    const currentLocation = allRows?.[currentIndex]?.location;

    return locationOptions.filter(
      (option) =>
        option.value === currentLocation ||
        !selectedByOtherRows.includes(option.value),
    );
  };

  const handleSubmit = async (values) => {
    const { initialStocks = [], name, sku, price, lowStockThreshold } = values;

    if (initialStocks.length === 0) {
      messageApi.error("Please add at least one location with quantity");
      return;
    }

    try {
      await createItem({
        name,
        sku,
        price,
        lowStockThreshold,
        initialStocks,
      }).unwrap();

      messageApi.success("Item created successfully across all locations");
      navigate(ROUTE_URL.ITEMS);
    } catch (error) {
      messageApi.error(error?.data?.message || "Failed to create item");
    }
  };

  return (
    <div>
      {contextHolder}
      <PageHeaderBar
        title="Add Item"
        subtitle="Create one item and set initial stock by location"
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
        <ItemForm
          form={form}
          onFinish={handleSubmit}
          isLoading={isCreating}
          isLocationsLoading={isLocationsLoading}
          getAvailableLocations={getAvailableLocations}
          onCancel={() => navigate(ROUTE_URL.ITEMS)}
          submitText="Create Item"
          initialValues={{
            lowStockThreshold: 5,
            initialStocks: [{ quantity: 1 }],
          }}
        />
      </Card>
    </div>
  );
};

export default AddItemPage;
