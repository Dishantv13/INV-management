import { useState } from "react";
import { Card, Select } from "antd";
import { useSearchParams } from "react-router-dom";
import PageHeaderBar from "../components/PageHeaderBar";
import StockHistoryTable from "../components/StockHistoryTable";
import { useGetItemsQuery } from "../services/itemApi";
import { useStockHistoryQuery } from "../services/stockMovementApi";

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const StockHistoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialItemId = searchParams.get("itemId");
  const page = parsePositiveInt(searchParams.get("page")) || 1;
  const limit = parsePositiveInt(searchParams.get("limit")) || 10;
  const [selectedItemId, setSelectedItemId] = useState(initialItemId || null);

  const { data: items = [], isLoading: itemsLoading } = useGetItemsQuery();
  const {
    data: historyResponse = { data: [], pagination: null },
    isLoading: historyLoading,
  } = useStockHistoryQuery(
    { itemId: selectedItemId, page, limit },
    { refetchOnMountOrArgChange: true }
  );

  const handleItemChange = (value) => {
    setSelectedItemId(value || null);
    updateSearchParams(value || null, 1, limit);
  };

  const updateSearchParams = (itemId, nextPage = page, nextLimit = limit) => {
    const nextParams = new URLSearchParams(searchParams);

    if (itemId) {
      nextParams.set("itemId", itemId);
    } else {
      nextParams.delete("itemId");
    }

    nextParams.set("page", String(nextPage));
    nextParams.set("limit", String(nextLimit));
    setSearchParams(nextParams);
  };

  const handlePaginationChange = (nextPage, nextPageSize) => {
    updateSearchParams(selectedItemId, nextPage, nextPageSize);
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
      <StockHistoryTable
        data={historyResponse.data}
        loading={historyLoading}
        pagination={historyResponse.pagination}
        onPaginationChange={handlePaginationChange}
      />
    </div>
  );
};

export default StockHistoryPage;
