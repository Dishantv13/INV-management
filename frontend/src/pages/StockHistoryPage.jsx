import { useState } from "react";
import { Card, Select } from "antd";
import { useSearchParams } from "react-router-dom";
import PageHeaderBar from "../components/PageHeaderBar";
import StockHistoryTable from "../components/StockHistoryTable";
import { useGetItemsQuery } from "../services/itemApi";
import { useStockHistoryQuery } from "../services/stockMovementApi";

const StockHistoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialItemId = searchParams.get("itemId");
  const [selectedItemId, setSelectedItemId] = useState(initialItemId || null);
  const { data: items = [], isLoading: itemsLoading } = useGetItemsQuery();
  const { data: history = [], isLoading: historyLoading } =
    useStockHistoryQuery(selectedItemId, { refetchOnMountOrArgChange: true });

  const handleItemChange = (value) => {
    setSelectedItemId(value || null);
    updateSearchParams(value || null);
  };

  const updateSearchParams = (itemId) => {
    if (itemId) {
      searchParams.set("itemId", itemId);
    } else {
      searchParams.delete("itemId");
    }
    setSearchParams(searchParams);
  };

  return (
    <div>
      <PageHeaderBar
        title="Stock History"
        subtitle="View all stock movement logs by item"
      />
      <Card style={{ marginBottom: 16 }}>
        <Select
          style={{ width: "100%" }}
          placeholder="Search item to filter history"
          value={selectedItemId}
          onChange={handleItemChange}
          allowClear
          loading={itemsLoading}
          options={items.map((item) => ({
            value: item._id,
            label: `${item.name} (${item.sku})`,
          }))}
        />
      </Card>
      <StockHistoryTable data={history} loading={historyLoading} />
    </div>
  );
};

export default StockHistoryPage;
