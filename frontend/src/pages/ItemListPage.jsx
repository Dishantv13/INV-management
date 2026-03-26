import { useState } from "react";
import { Button, Card, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import AddItemModal from "../components/AddItemModel";
import ItemTable from "../components/ItemTable";
import PageHeaderBar from "../components/PageHeaderBar";
import { useCreateItemMutation, useGetItemsPaginatedQuery } from "../services/itemApi";

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const ItemListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePositiveInt(searchParams.get("page")) || 1;
  const limit = parsePositiveInt(searchParams.get("limit")) || 10;
  
  const [messageApi, contextHolder] = message.useMessage();
  const [openAddModal, setOpenAddModal] = useState(false);
  const {
    data: itemResponse = { data: [], pagination: null },
    isLoading,
  } = useGetItemsPaginatedQuery({ page, limit });
  const [createItem, { isLoading: isCreating }] = useCreateItemMutation();

  const handlePaginationChange = (nextPage, nextPageSize) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(nextPage));
    nextParams.set("limit", String(nextPageSize));
    setSearchParams(nextParams);
  };

  const handleAddItem = async (payload) => {
    try {
      await createItem(payload).unwrap();
      messageApi.success("Item created successfully");
      setOpenAddModal(false);
    } catch (error) {
      messageApi.error(error?.data?.message || "Failed to create item");
    }
  };

  return (
    <div>
      {contextHolder}
      <PageHeaderBar
        title="Item List"
        subtitle="Manage inventory items and monitor stock levels"
        rightNode={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpenAddModal(true)}>
            Add Item
          </Button>
        }
      />

      <Card>
        <ItemTable
          items={itemResponse.data}
          loading={isLoading}
          pagination={itemResponse.pagination}
          onPaginationChange={handlePaginationChange}
        />
      </Card>

      <AddItemModal
        open={openAddModal}
        loading={isCreating}
        onCancel={() => setOpenAddModal(false)}
        onSubmit={handleAddItem}
      />
    </div>
  );
};

export default ItemListPage;
