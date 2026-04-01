import { message } from "antd";
import PageHeaderBar from "../components/PageHeaderBar";
import StockAdjustmentForm from "../components/StockAdjustmentForm";
import {
  useStockInMutation,
  useStockOutMutation,
} from "../services/stockMovementApi";
import {
  useGetActiveLocationsQuery,
  useLazyGetLocationItemsQuery,
} from "../services/locationApi";

const StockAdjustmentPage = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const {
    data: locationsResponse = { data: [] },
    isLoading: locationsLoading,
  } = useGetActiveLocationsQuery({ page: 1, limit: 1000 });
  const [fetchLocationItems, { data: locationItemsResponse, isFetching: isItemsFetching }] =
    useLazyGetLocationItemsQuery();

  const [stockIn, { isLoading: isStockInLoading }] = useStockInMutation();
  const [stockOut, { isLoading: isStockOutLoading }] = useStockOutMutation();

  const handleLocationChange = async (locationId) => {
    if (!locationId) {
      return;
    }

    try {
      await fetchLocationItems({
        locationId,
        page: 1,
        limit: 1000,
      }).unwrap();
    } catch {
      messageApi.error("Failed to load items for selected location");
    }
  };

  const handleSubmit = async ({ locationId, reference, note, adjustments = [] }) => {
    const validAdjustments = adjustments.filter((row) => row?.itemId);

    if (validAdjustments.length === 0) {
      messageApi.error("Please add at least one item adjustment");
      return false;
    }

    const results = await Promise.allSettled(
      validAdjustments.map((row) => {
        const payload = {
          itemId: row.itemId,
          locationId,
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
          `${successCount} item adjustment(s) applied successfully`,
        );
        await fetchLocationItems({ locationId, page: 1, limit: 1000 }).unwrap();
        return true;
      }

      if (successCount > 0) {
        messageApi.warning(
          `${successCount} succeeded and ${failCount} failed. Please review and retry failed rows.`,
        );
        await fetchLocationItems({ locationId, page: 1, limit: 1000 }).unwrap();
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
    locationsLoading || isItemsFetching || isStockInLoading || isStockOutLoading;

  return (
    <div>
      {contextHolder}
      <PageHeaderBar
        title="Stock Adjustment"
        subtitle="Select location, then adjust multiple items in one submit"
      />
      <StockAdjustmentForm
        locations={locationsResponse.data}
        locationItems={locationItemsResponse?.data || []}
        loading={loading}
        itemsLoading={isItemsFetching}
        locationsLoading={locationsLoading}
        onSubmit={handleSubmit}
        onLocationChange={handleLocationChange}
      />
    </div>
  );
};

export default StockAdjustmentPage;
