import { useMemo } from "react";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import PageHeaderBar from "../components/PageHeaderBar";
import { locationStockColumns } from "../components/itemColumns";
import {
  useGetLocationByIdQuery,
  useGetItemsByLocationQuery,
} from "../services/locationApi";
import { ROUTE_URL } from "../enum/url";
import ViewLocationItem from "../components/ViewLocationItem";

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const LocationItemsPage = () => {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parsePositiveInt(searchParams.get("page"), 1);
  const limit = parsePositiveInt(searchParams.get("limit"), 10);

  const {
    data: location,
    isLoading: isLocationLoading,
    isError: isLocationError,
  } = useGetLocationByIdQuery(locationId, {
    skip: !locationId,
  });

  const {
    data: itemsByLocationResponse = { data: [], pagination: null },
    isLoading: isItemsByLocationLoading,
    isError: isItemsError,
    refetch,
  } = useGetItemsByLocationQuery(
    { locationId, page, limit },
    { skip: !locationId },
  );

  const handlePaginationChange = (nextPage, nextPageSize) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(nextPage));
    nextParams.set("limit", String(nextPageSize));
    setSearchParams(nextParams);
  };

  const totalItems = itemsByLocationResponse?.pagination?.totalItems || 0;

  const itemColumns = useMemo(() => locationStockColumns, []);

  return (
    <div>
      <PageHeaderBar
        title={location?.name ? `Items in ${location.name}` : "Location Items"}
        subtitle={
          location?.locationNo
            ? `Location #${location.locationNo}`
            : "Browse and verify stock available in this location"
        }
        rightNode={
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTE_URL.LOCATIONS)}
          >
            Back to Locations
          </Button>
        }
      />

      <ViewLocationItem
        type="location" 
        headerData={{ ...location, totalItems }}
        columns={itemColumns}
        data={itemsByLocationResponse.data}
        loading={isLocationLoading || isItemsByLocationLoading}
        isHeaderError={isLocationError}
        isTableError={isItemsError}
        onRetry={refetch}
        pagination={itemsByLocationResponse.pagination}
        onPaginationChange={handlePaginationChange}
      />
    </div>
  );
};

export default LocationItemsPage;
