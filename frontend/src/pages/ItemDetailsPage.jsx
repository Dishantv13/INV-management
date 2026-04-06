import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import PageHeaderBar from "../components/PageHeaderBar";
import ViewLocationItem from "../components/ViewLocationItem";
import { getItemColumns } from "../components/itemColumns";
import { useGetItemByIdQuery, useGetItemLocationQuery } from "../services/itemApi";
import { ROUTE_URL } from "../enum/url";

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};
const ItemDetailsPage = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parsePositiveInt(searchParams.get("page"), 1);
  const limit = parsePositiveInt(searchParams.get("limit"), 5);

  const { data: item, isLoading: isItemLoading, isError: isItemError } = useGetItemByIdQuery(itemId);
  const {
    data,
    isLoading: isLocationsLoading,
    isError: isLocationsError,
    refetch,
  } = useGetItemLocationQuery(
    { id: String(itemId || ""), page, limit },
    { skip: !itemId },
  );

  const locations = data?.data || [];
  const lowStockThreshold = data?.lowStockThreshold || null;
  const pagination = data?.pagination || null;

  const onPaginationChange = (newPage, newPageSize) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(newPage));
    nextParams.set("limit", String(newPageSize));
    setSearchParams(nextParams);
  };

  const inventoryColumns = getItemColumns({
    showName: false,
    showSku: false,
    showPrice: false,
    showInventory: true,
    showLowStockStatus: true,
    globalThreshold: lowStockThreshold,
  });

  return (
    <div>
      <PageHeaderBar
        title={item?.name ? `Stock Details: ${item.name}` : "Item Details"}
        subtitle="Distribution across physical locations"
        rightNode={
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTE_URL.ITEMS)}
          >
            Back to Items
          </Button>
        }
      />

      <ViewLocationItem
        type="item"
        headerData={item}
        columns={inventoryColumns}
        data={locations}
        loading={isItemLoading || isLocationsLoading}
        isHeaderError={isItemError}
        isTableError={isLocationsError}
        onRetry={refetch}
        entityName="locations"
        emptyText="No stock available in any location"
        pagination={pagination}
        onPaginationChange={onPaginationChange}
      />
    </div>
  );
};

export default ItemDetailsPage;
