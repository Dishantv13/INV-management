import { Layout, Menu, Typography } from "antd";
import {
  BarChartOutlined,
  DatabaseOutlined,
  HistoryOutlined,
  SwapOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { ROUTE_URL } from "../enum/url";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const navigationItems = [
  {
    key: ROUTE_URL.DASHBOARD,
    icon: <BarChartOutlined />,
    label: <Link to={ROUTE_URL.DASHBOARD}>Dashboard</Link>,
  },
  {
    key: ROUTE_URL.LOCATIONS,
    icon: <EnvironmentOutlined />,
    label: <Link to={ROUTE_URL.LOCATIONS}>Locations</Link>,
  },
  {
    key: ROUTE_URL.ITEMS,
    icon: <DatabaseOutlined />,
    label: <Link to={ROUTE_URL.ITEMS}>Items</Link>,
  },
  {
    key: ROUTE_URL.STOCK_ADJUSTMENT,
    icon: <SwapOutlined />,
    label: <Link to={ROUTE_URL.STOCK_ADJUSTMENT}>Stock Adjustment</Link>,
  },
  {
    key: ROUTE_URL.STOCK_HISTORY,
    icon: <HistoryOutlined />,
    label: <Link to={ROUTE_URL.STOCK_HISTORY}>Stock History</Link>,
  },
];

const AppLayout = ({ children }) => {
  const { pathname } = useLocation();

  const selectedKey = navigationItems.find((item) => {
    return pathname === item.key || pathname.startsWith(item.key + "/");
  })?.key || "/";

  return (
    <Layout className="app-shell">
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        width={240}
        theme="light"
        style={{
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="brand-block">
          <Title level={4}>Inventory Pro</Title>
          <Text type="secondary">Stock movement tracking</Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={navigationItems}
          className="side-menu"
        />
      </Sider>
      <Layout style={{ marginLeft: 240 }}>
        <Header
          className="app-header"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            background: "#fff",
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Inventory Management
          </Title>
        </Header>
        <Content
          className="app-content"
          style={{
            height: "calc(100vh - 64px)",
            overflowY: "auto",
            padding: "16px",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
