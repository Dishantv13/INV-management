import { Row, Col, Card, Statistic } from "antd";
import {
  DatabaseOutlined,
  WarningOutlined,
  InboxOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";

const DashboardCard = ({ items }) => {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <Card variant="borderless" hoverable>
          <Statistic
            title="Total Items"
            value={items?.totalItems || 0}
            prefix={<DatabaseOutlined style={{ color: "#1677ff" }} />}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card variant="borderless" hoverable>
          <Statistic
            title="Low Stock Alerts"
            value={items?.lowStockItems || 0}
            valueStyle={{
              color: items?.lowStockItems > 0 ? "#cf1322" : "#3f8600",
            }}
            prefix={<WarningOutlined />}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card variant="borderless" hoverable>
          <Statistic
            title="Inventory Value"
            value={items?.totalStockValue || 0}
            precision={2}
            prefix={<ShoppingOutlined style={{ color: "#faad14" }} />}
            suffix="₹"
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card variant="borderless" hoverable>
          <Statistic
            title="Total Units in Stock"
            value={items?.totalStockUnits || 0}
            valueStyle={{ color: "#166534" }}
            prefix={<InboxOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default DashboardCard;
