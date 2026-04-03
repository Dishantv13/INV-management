import { Button, Card } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import ItemTable from "../components/ItemTable";
import PageHeaderBar from "../components/PageHeaderBar";
import { useGetItemsPaginatedQuery } from "../services/itemApi";
import { ROUTE_URL } from "../enum/url";

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const ItemListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate(); 
  const page = parsePositiveInt(searchParams.get("page")) || 1;
  const limit = parsePositiveInt(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || "";

  const { data: itemResponse = { data: [], pagination: null }, isLoading } =
    useGetItemsPaginatedQuery({ page, limit, search });

  const handlePaginationChange = (nextPage, nextPageSize) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(nextPage));
    nextParams.set("limit", String(nextPageSize));
    setSearchParams(nextParams);
  };

  const handleSearchChange = (value) => {
    const searchValue =
      typeof value === "string"
        ? value.trim()
        : value?.target?.value?.trim() || "";
    const nextParams = new URLSearchParams(searchParams);
    if (searchValue) {
      nextParams.set("search", searchValue);
    } else {
      nextParams.delete("search");
    }
    nextParams.set("page", "1");
    setSearchParams(nextParams);
  };

  const handleRowClick = (record) => {
    navigate(ROUTE_URL.ITEM_DETAILS(record._id));
  };

  return (
    <div>
      <PageHeaderBar
        title="Item List"
        subtitle="Manage inventory items and monitor stock levels"
        showSearch
        onSearch={handleSearchChange}
        defaultSearchValue={search}
        rightNode={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(ROUTE_URL.ITEM_ADD)}
          >
            Add Item
          </Button>
        }
      />

      <Card>
        <ItemTable
          items={itemResponse.data}
          loading={isLoading}
          pagination={itemResponse.pagination}
          onPaginationChange={handlePaginationChange}
          onRowClick={handleRowClick}
        />
      </Card>
    </div>
  );
};

export default ItemListPage;
