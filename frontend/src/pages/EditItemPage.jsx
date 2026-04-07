import { useMemo, useEffect } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Card, Form, message, Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import PageHeaderBar from "../components/PageHeaderBar";
import ItemForm from "../components/ItemForm";
import { ROUTE_URL } from "../enum/url";
import { useGetItemByIdQuery, useUpdateItemMutation } from "../services/itemApi";
import { useGetActiveLocationsQuery } from "../services/locationApi";

const EditItemPage = () => {
  const { itemId } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const { data: item, isLoading: isItemLoading } = useGetItemByIdQuery(itemId);
  const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation();
  const {
    data: locationResponse = { data: [] },
    isLoading: isLocationsLoading,
  } = useGetActiveLocationsQuery();

  useEffect(() => {
    if (item) {
      form.setFieldsValue({
        name: item.name,
        sku: item.sku,
        price: item.price,
        lowStockThreshold: item.lowStockThreshold,
        initialStocks: [],
      });
    }
  }, [item, form]);

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

    const inventoryLocationIds = (item?.inventory || []).map((inv) =>
      String(inv.locationId),
    );

    return locationOptions.filter(
      (option) =>
        !inventoryLocationIds.includes(String(option.value)) &&
        !selectedByOtherRows.includes(option.value),
    );
  };

  const handleSubmit = async (values) => {
    const { initialStocks = [], name, price, lowStockThreshold } = values;

    try {
      await updateItem({
        id: itemId,
        name,
        price,
        lowStockThreshold,
        initialStocks,
      }).unwrap();

      message.success("Item updated successfully");
      navigate(ROUTE_URL.ITEM_DETAILS(itemId));
    } catch (error) {
      message.error(error?.data?.message || "Failed to update item");
    }
  };

  if (isItemLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <PageHeaderBar
        title="Edit Item"
        subtitle={`Update details or add stocks for ${item?.name || "item"}`}
        rightNode={
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTE_URL.ITEM_DETAILS(itemId))}
          >
            Back to Details
          </Button>
        }
      />
      <Card>
        <ItemForm
          form={form}
          onFinish={handleSubmit}
          isLoading={isUpdating}
          isLocationsLoading={isLocationsLoading}
          getAvailableLocations={getAvailableLocations}
          onCancel={() => navigate(ROUTE_URL.ITEM_DETAILS(itemId))}
          submitText="Update Item"
          disabledSku={true}
          isUpdate={true}
        />
      </Card>
    </div>
  );
};

export default EditItemPage;
