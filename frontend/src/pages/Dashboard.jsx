import { Row, Col } from "antd";
import { useSearchParams } from "react-router-dom";
import DashboardCard from "../components/DashboardCard";
import LowStockTable from "../components/LowStockTable";
import PageHeaderBar from "../components/PageHeaderBar";
import { useGetItemsPaginatedQuery, useGetItemsQuery } from "../services/itemApi";

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePositiveInt(searchParams.get("page"), 1);
  const limit = parsePositiveInt(searchParams.get("limit"), 5);

  const { data: items = [] } = useGetItemsQuery();
  const {
    data: lowStockResponse = { data: [], pagination: null },
    isLoading,
  } = useGetItemsPaginatedQuery({
    page,
    limit,
    lowStockOnly: true,
  });

  const handlePaginationChange = (nextPage, nextPageSize) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(nextPage));
    nextParams.set("limit", String(nextPageSize));
    setSearchParams(nextParams);
  };

  return (
    <div>
      <PageHeaderBar
        title="Inventory Dashboard"
        subtitle="Overview of stock health and key metrics"
      />

      <DashboardCard items={items} />

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <LowStockTable
            items={lowStockResponse.data}
            loading={isLoading}
            pagination={lowStockResponse.pagination}
            onPaginationChange={handlePaginationChange}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
