import { Space, Typography } from "antd";

const { Title, Text } = Typography;

const PageHeaderBar = ({ title, subtitle, rightNode }) => {
  return (
    <div className="page-header-bar">
      <Space direction="vertical" size={0}>
        <Title level={3} style={{ margin: 0 }}>
          {title}
        </Title>
        {subtitle ? <Text type="secondary">{subtitle}</Text> : null}
      </Space>
      {rightNode}
    </div>
  );
};

export default PageHeaderBar;
