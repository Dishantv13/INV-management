import { useState, useEffect } from "react";
import { Card, Typography, Empty, message } from "antd";
import { useSearchParams } from "react-router-dom";
import PageHeaderBar from "../components/PageHeaderBar";
import StockHistoryTable from "../components/StockHistoryTable";
import ItemReportFilter from "../components/ItemReportFilter";
import { useGetItemsQuery } from "../services/itemApi";
import { useLazyStockHistoryQuery } from "../services/stockMovementApi";

const { Text } = Typography;

const ItemReportPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialItemId = searchParams.get("itemId");
  const [selectedItemId, setSelectedItemId] = useState(initialItemId || null);
  const [reportData, setReportData] = useState([]);
  const [isGenerated, setIsGenerated] = useState(false);

  const { data: itemsResponse = [], isLoading: itemsLoading } = useGetItemsQuery({
    page: 1,
    limit: 1000,
  });

  const [triggerHistory, { isFetching }] = useLazyStockHistoryQuery();

  useEffect(() => {
    if (initialItemId && itemsResponse.length > 0 && !isGenerated) {
      handleGenerateReport();
    }
  }, [initialItemId, itemsResponse]);
  const handleGenerateReport = async () => {
    if (!selectedItemId) {
      message.warning("Please select an item first");
      return;

    }

    try {
      const result = await triggerHistory({ itemId: selectedItemId, limit: 1000 }).unwrap();
      setReportData(result.data || []);
      setIsGenerated(true);
      setSearchParams({ itemId: selectedItemId });
    } catch {
      message.error("Failed to generate report");
    }
  };

  const handleItemChange = (value) => {
    setSelectedItemId(value);
    setIsGenerated(false);
  };

  const selectedItem = itemsResponse.find(i => i._id === selectedItemId);

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <PageHeaderBar
        title="Item Movement Report"
        subtitle="Generate detailed sequential movement history for individual items"
      />

      <ItemReportFilter
        items={itemsResponse}
        loading={itemsLoading}
        fetching={isFetching}
        selectedItemId={selectedItemId}
        onChange={handleItemChange}
        onGenerate={handleGenerateReport}
      />

      {isGenerated ? (
        <Card style={{ marginBottom: 24 }}>
          <StockHistoryTable
            type="report"
            historyId={true}
            selectedItem={selectedItem}
            totalEntries={reportData.length}
            data={reportData}
            loading={isFetching}
            scroll={{ x: 800 }}
          />
        </Card>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Text type="secondary" style={{ fontSize: 16 }}>
              Select an item above and click <strong>Generate Report</strong> to view movement history
            </Text>
          }
          style={{ marginTop: 60 }}
        />
      )}
    </div>
  );
};

export default ItemReportPage;
