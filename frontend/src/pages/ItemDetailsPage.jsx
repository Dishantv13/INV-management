import { useParams, useNavigate } from "react-router-dom";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import PageHeaderBar from "../components/PageHeaderBar";
import ViewLocationItem from "../components/ViewLocationItem";
import { getItemColumns } from "../components/itemColumns";
import { useGetItemByIdQuery, useGetItemLocationQuery } from "../services/itemApi";
import { ROUTE_URL } from "../enum/url";


const ItemDetailsPage = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();

  const { data: item, isLoading: isItemLoading, isError: isItemError } = useGetItemByIdQuery(itemId);
  const { data, isLoading: isLocationsLoading, isError: isLocationsError, refetch } =
    useGetItemLocationQuery(itemId);

  const locations = data?.data?.inventory || [];
  const lowStockThreshold = data?.data?.lowStockThreshold || null;

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
      />
    </div>
  );
};

export default ItemDetailsPage;
