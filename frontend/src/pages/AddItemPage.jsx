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

    const results = await Promise.allSettled(
      initialStocks.map((stock) =>
        createItem({
          name,
          sku,
          price,
          currentStock: Number(stock.quantity),
          lowStockThreshold,
          location: stock.location,
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
        `Item created in ${initialStocks.length} location(s) successfully`,
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
