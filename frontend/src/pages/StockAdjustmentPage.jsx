import { message } from "antd";
import PageHeaderBar from "../components/PageHeaderBar";
import StockAdjustmentForm from "../components/StockAdjustmentForm";
import {
  useStockInMutation,
  useStockOutMutation,
} from "../services/stockMovementApi";
import {
  useLazyGetItemByIdQuery,
  useGetItemsQuery,
} from "../services/itemApi";
import { useGetActiveLocationsQuery } from "../services/locationApi";

const StockAdjustmentPage = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const {
    data: itemsResponse = [],
    isLoading: itemsLoading,
  } = useGetItemsQuery({ page: 1, limit: 1000 });

  const {
    data: locationsResponse = { data: [] },
    isLoading: locationsLoading,
  } = useGetActiveLocationsQuery({ page: 1, limit: 1000 });

  const [fetchItemDetails, { data: selectedItemDetails, isFetching: isItemFetching }] =
    useLazyGetItemByIdQuery();

  const [stockIn, { isLoading: isStockInLoading }] = useStockInMutation();
  const [stockOut, { isLoading: isStockOutLoading }] = useStockOutMutation();

  const handleItemChange = async (itemId) => {
    if (!itemId) {
      return;
    }

    try {
      await fetchItemDetails(itemId).unwrap();
    } catch {
      messageApi.error("Failed to load details for selected item");
    }
  };

  const handleSubmit = async ({ itemId, reference, note, adjustments = [] }) => {
    const validAdjustments = adjustments.filter((row) => row?.locationId);

    if (validAdjustments.length === 0) {
      messageApi.error("Please add at least one location adjustment");
      return false;
    }

    const results = await Promise.allSettled(
      validAdjustments.map((row) => {
        const payload = {
          itemId,
          locationId: row.locationId,
          quantity: Number(row.quantity),
          reference,
          note,
        };

        return row.type === "IN"
          ? stockIn(payload).unwrap()
          : stockOut(payload).unwrap();
      }),
    );

    const successCount = results.filter(
      (result) => result.status === "fulfilled",
    ).length;
    const failCount = results.length - successCount;

    try {
      if (successCount > 0 && failCount === 0) {
        messageApi.success(
          `${successCount} location adjustment(s) applied successfully`,
        );
        await fetchItemDetails(itemId).unwrap();
        return true;
      }

      if (successCount > 0) {
        messageApi.warning(
          `${successCount} succeeded and ${failCount} failed. Please review and retry failed rows.`,
        );
        await fetchItemDetails(itemId).unwrap();
        return false;
      }

      const firstError = results.find((result) => result.status === "rejected");
      messageApi.error(
        firstError?.reason?.data?.message || "Stock update failed",
      );
      return false;
    } catch {
      return false;
    }
  };

  const loading =
    itemsLoading || isItemFetching || isStockInLoading || isStockOutLoading || locationsLoading;

  return (
    <div>
      {contextHolder}
      <PageHeaderBar
        title="Stock Adjustment"
        subtitle="Select item, then adjust stock across multiple locations"
      />
      <StockAdjustmentForm
        items={itemsResponse}
        selectedItemDetails={selectedItemDetails}
        locations={locationsResponse.data}
        loading={loading}
        itemFetching={isItemFetching}
        itemsLoading={itemsLoading}
        onSubmit={handleSubmit}
        onItemChange={handleItemChange}
      />
    </div>
  );
};

export default StockAdjustmentPage;
