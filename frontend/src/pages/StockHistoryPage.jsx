import { useState } from "react";
import { Card, Input } from "antd";
import { useSearchParams } from "react-router-dom";
import PageHeaderBar from "../components/PageHeaderBar";
import StockHistoryTable from "../components/StockHistoryTable";
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
  const search = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState("");

  const {
    data: historyResponse = { data: [], pagination: null },
    isLoading: historyLoading,
  } = useStockHistoryQuery(
    { search, page, limit },
    { refetchOnMountOrArgChange: true },
  );

  const handleSearch = (value) => {
    const searchValue =
      typeof value === "string"
        ? value.trim()
        : value?.target?.value?.trim() || "";
    setSearchInput(searchValue);
    updateSearchParams(searchValue, 1, limit);
  };

  const updateSearchParams = (search, nextPage = page, nextLimit = limit) => {
    const nextParams = new URLSearchParams(searchParams);

    if (search) {
      nextParams.set("search", search);
    } else {
      nextParams.delete("search");
    }

    nextParams.set("page", String(nextPage));
    nextParams.set("limit", String(nextLimit));
    setSearchParams(nextParams);
  };

  const handlePaginationChange = (nextPage, nextPageSize) => {
    updateSearchParams(searchInput, nextPage, nextPageSize);
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
          loading={historyLoading}
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
      <StockHistoryTable  
        showItem={true}
        currentStock={true}
        data={historyResponse.data}
        loading={historyLoading}
        pagination={historyResponse.pagination}
        onPaginationChange={handlePaginationChange}
      />
    </div>
  );
};

export default StockHistoryPage;
