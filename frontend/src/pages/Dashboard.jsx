import { Row, Col } from "antd";
import DashboardCard from "../components/DashboardCard";
import LowStockTable from "../components/LowStockTable";
import PageHeaderBar from "../components/PageHeaderBar";
import { useGetItemsQuery } from "../services/itemApi";

const Dashboard = () => {
  const { data: items = [], isLoading } = useGetItemsQuery();

  return (
    <div>
      <PageHeaderBar
        title="Inventory Dashboard"
        subtitle="Overview of stock health and key metrics"
      />

      <DashboardCard items={items} />

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <LowStockTable items={items} loading={isLoading} />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
