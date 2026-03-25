import { Row, Col, Card, Statistic } from "antd";
import {
  DatabaseOutlined,
  WarningOutlined,
  InboxOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";

const DashboardCard = ({ items }) => {
  const lowStockItems = items.filter((item) => item.isLowStock);

  const totalStockValue = items.reduce(
    (acc, current) => acc + current.price * current.currentStock,
    0
  );

  const totalStockUnits = items.reduce(
    (acc, current) => acc + current.currentStock,
    0,
  );

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} hoverable>
          <Statistic
            title="Total Items"
            value={items.length}
            prefix={<DatabaseOutlined style={{ color: "#1677ff" }} />}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} hoverable>
          <Statistic
            title="Low Stock Alerts"
            value={lowStockItems.length}
            valueStyle={{
              color: lowStockItems.length > 0 ? "#cf1322" : "#3f8600",
            }}
            prefix={<WarningOutlined />}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} hoverable>
          <Statistic
            title="Inventory Value"
            value={totalStockValue}
            precision={2}
            prefix={<ShoppingOutlined style={{ color: "#faad14" }} />}
            suffix="₹"
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} hoverable>
          <Statistic
            title="Total Units in Stock"
            value={totalStockUnits}
            valueStyle={{ color: "#166534" }}
            prefix={<InboxOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default DashboardCard;