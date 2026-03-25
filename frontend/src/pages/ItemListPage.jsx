import { useState } from "react";
import { Button, Card, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import AddItemModal from "../components/AddItemModel";
import ItemTable from "../components/ItemTable";
import PageHeaderBar from "../components/PageHeaderBar";
import { useCreateItemMutation, useGetItemsQuery } from "../services/itemApi";

const ItemListPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [openAddModal, setOpenAddModal] = useState(false);
  const { data: items = [], isLoading } = useGetItemsQuery();
  const [createItem, { isLoading: isCreating }] = useCreateItemMutation();

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
        <ItemTable items={items} loading={isLoading} />
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
