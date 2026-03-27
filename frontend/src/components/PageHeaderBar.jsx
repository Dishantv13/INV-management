import { Space, Typography, Input } from "antd";

const { Search } = Input;
const { Title, Text } = Typography;

const PageHeaderBar = ({
  title,
  subtitle,
  rightNode,
  showSearch,
  searchPlaceholder,
  onSearch,
  defaultSearchValue,
}) => {
  return (
    <div className="page-header-bar">
      <Space direction="vertical" size={0}>
        <Title level={3} style={{ margin: 0 }}>
          {title}
        </Title>
        {subtitle ? <Text type="secondary">{subtitle}</Text> : null}
      </Space>

      <Space>
        {showSearch && (
          <Search
            placeholder={searchPlaceholder || "Search..."}
            onSearch={onSearch}
            onChange={(event) => {
              if (!event?.target?.value) {
                onSearch?.("");
              }
            }}
            defaultValue={defaultSearchValue}
            allowClear
            style={{ width: 250 }}
          />
        )}
      </Space>

      {rightNode}
    </div>
  );
};

export default PageHeaderBar;
