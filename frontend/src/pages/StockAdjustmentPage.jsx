import { message } from "antd";
import { useSearchParams } from "react-router-dom";
import PageHeaderBar from "../components/PageHeaderBar";
import StockAdjustmentForm from "../components/StockAdjustmentForm";
import { useGetItemsQuery } from "../services/itemApi";
import {
  useStockInMutation,
  useStockOutMutation,
} from "../services/stockMovementApi";

const StockAdjustmentPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedItemId = searchParams.get("itemId") || undefined;
  const { data: items = [], isLoading: itemsLoading } = useGetItemsQuery();
  const [stockIn, { isLoading: isStockInLoading }] = useStockInMutation();
  const [stockOut, { isLoading: isStockOutLoading }] = useStockOutMutation();
  const handleItemChange = (itemId) => {
    const nextParams = new URLSearchParams(searchParams);

    if (itemId) {
      nextParams.set("itemId", itemId);
    } else {
      nextParams.delete("itemId");
    }

    setSearchParams(nextParams, { replace: true });
  };

  const handleSubmit = async (values) => {
    const payload = {
      itemId: values.itemId,
      quantity: Number(values.quantity),
      reference: values.reference,
      note: values.note,
    };

    try {
      if (values.type === "IN") {
        await stockIn(payload).unwrap();
      } else {
        await stockOut(payload).unwrap();
      }
      messageApi.success(
        `variation ${values.type === "IN" ? "added to" : "removed from"} stock successfully`,
      );
      return true;
    } catch (error) {
      messageApi.error(error?.data?.message || "Stock update failed");
      return false;
    }
  };

  const loading = itemsLoading || isStockInLoading || isStockOutLoading;

  return (
    <div>
      {contextHolder}
      <PageHeaderBar
        title="Stock Adjustment"
        subtitle="Add or remove stock through movement entries"
      />
      <StockAdjustmentForm
        items={items}
        loading={loading}
        onSubmit={handleSubmit}
        selectedItemId={selectedItemId}
        onItemChange={handleItemChange}
      />
    </div>
  );
};

export default StockAdjustmentPage;
