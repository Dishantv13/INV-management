import { Card, Space, Select, Button, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Text } = Typography;

const ItemReportFilter = ({
  items = [],
  loading = false,
  fetching = false,
  selectedItemId,
  onChange,
  onGenerate,
}) => {
  return (
    <Card
      className="glass-card"
      style={{ marginBottom: 24, borderRadius: 12 }}
      styles={{ body: { padding: "24px" } }}
    >
      <Space size="large">
        <div style={{ width: 300 }}>
          <div style={{ marginBottom: 8 }}>
            <Text strong>Select Item</Text>
          </div>

          <Select
            showSearch
            placeholder="Search item by name or SKU"
            style={{ width: "100%" }}
            value={selectedItemId}
            loading={loading}
            optionFilterProp="children"
            onChange={onChange}
            filterOption={(input, option) =>
              (option?.label ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            options={items.map((item) => ({
              value: item._id,
              label: `${item.name} (${item.sku})`,
            }))}
          />
        </div>

        <div style={{ alignSelf: "flex-end" }}>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            size="large"
            loading={fetching}
            onClick={onGenerate}
            style={{ borderRadius: 8, height: 40, marginTop: 20 }}
          >
            Generate Report
          </Button>
        </div>
      </Space>
    </Card>
  );
};

export default ItemReportFilter;