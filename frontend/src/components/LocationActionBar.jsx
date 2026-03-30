import { Card, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const LocationActionBar = ({ onAddClick }) => {
  return (
    <Card style={{ marginBottom: 16 }}>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={onAddClick}
        size="large"
      >
        Add Location
      </Button>
    </Card>
  );
};

export default LocationActionBar;
