import { useEffect, useState } from "react";
import { Card, Input, Empty } from "antd";
import { useSearchParams } from "react-router-dom";
import PageHeaderBar from "../components/PageHeaderBar";
import StockHistoryTable from "../components/StockHistoryTable";
import { useGetItemsQuery } from "../services/itemApi";
import { useStockHistoryQuery } from "../services/stockMovementApi";

const { Search } = Input;

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const StockHistoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePositiveInt(searchParams.get("page")) || 1;
  const limit = parsePositiveInt(searchParams.get("limit")) || 10;
  const selectedItemId = searchParams.get("itemId") || null;
  const [searchInput, setSearchInput] = useState("");
  const [hasNoMatch, setHasNoMatch] = useState(false);

  const { data: items = [], isLoading: itemsLoading } = useGetItemsQuery();
  const {
    data: historyResponse = { data: [], pagination: null },
    isLoading: historyLoading,
  } = useStockHistoryQuery(
    { itemId: selectedItemId, page, limit },
    { refetchOnMountOrArgChange: true },
  );

  useEffect(() => {
    if (!selectedItemId) {
      setSearchInput("");
      setHasNoMatch(false);
      return;
    }

    const selectedItem = items.find((item) => item._id === selectedItemId);
    setSearchInput(selectedItem ? selectedItem.name || selectedItem.sku : "");
    setHasNoMatch(false);
  }, [selectedItemId, items]);

  const handleSearch = (value) => {
    const searchValue =
      typeof value === "string"
        ? value.trim()
        : value?.target?.value?.trim() || "";

    if (!searchValue) {
      setHasNoMatch(false);
      updateSearchParams(null, 1, limit);
      return;
    }

    const matchedItem = items.find(
      (item) =>
        item.name.toLowerCase() === searchValue.toLowerCase() ||
        item.sku.toLowerCase() === searchValue.toLowerCase(),
    );
    if (matchedItem) {
      setHasNoMatch(false);
      updateSearchParams(matchedItem._id, 1, limit);
    } else {
      setHasNoMatch(true);
      updateSearchParams(null, 1, limit);
    }
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
        <Search
          placeholder="Search item to filter history"
          value={searchInput}
          onSearch={handleSearch}
          loading={itemsLoading}
          onChange={(e) => {
            setSearchInput(e?.target?.value || "");
            if (!e?.target?.value) {
              handleSearch("");
            }
          }}
          allowClear
          style={{ width: 300 }}
        />
      </Card>
      {hasNoMatch ? (
        <Empty description="No items found with that name or SKU" />
      ) : (
        <StockHistoryTable
          data={historyResponse.data}
          loading={historyLoading}
          pagination={historyResponse.pagination}
          onPaginationChange={handlePaginationChange}
        />
      )}
    </div>
  );
};

export default StockHistoryPage;
