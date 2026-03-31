import { useState } from "react";
import { Form, message, Button } from "antd";
import { useSearchParams } from "react-router-dom";
import PageHeaderBar from "../components/PageHeaderBar";
import LocationFormModal from "../components/LocationFormModal";
import LocationTable from "../components/LocationTable";
import ViewLocationItem from "../components/ViewLocationItem";
import { locationStockColumns } from "../components/itemColumns";
import {
  useGetLocationsQuery,
  useLazyGetLocationItemsQuery,
  useCreateLocationMutation,
  useUpdateLocationStatusMutation,
  useDeleteLocationMutation,
} from "../services/locationApi";

const LocationsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [form] = Form.useForm();

  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const itemPage = parseInt(searchParams.get("itemPage")) || 1;
  const itemLimit = parseInt(searchParams.get("itemLimit")) || 10;
  const search = searchParams.get("search") || "";

  const {
    data: locationsResponse = { data: [], pagination: null },
    isLoading: locationsLoading,
  } = useGetLocationsQuery({ page, limit, search });

  const [createLocation, { isLoading: createLoading }] =
    useCreateLocationMutation();
  const [updateLocationStatus, { isLoading: statusLoading }] =
    useUpdateLocationStatusMutation();
  const [deleteLocation, { isLoading: deleteLoading }] =
    useDeleteLocationMutation();
  const [
    triggerGetLocationItems,
    {
      data: locationItems = { data: [], pagination: null },
      isFetching: locationItemsLoading,
    },
  ] = useLazyGetLocationItemsQuery({
    itemPage,
    itemLimit,
  });

  const itemColumns = locationStockColumns;

  const handleAddLocation = async () => {
    try {
      const values = await form.validateFields();
      await createLocation(values).unwrap();
      message.success("Location created successfully");
      form.resetFields();
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.data?.message || "Failed to create location");
    }
  };

  const handleToggleStatus = async (locationId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      await updateLocationStatus({ locationId, status: newStatus }).unwrap();
      message.success(
        `Location ${newStatus === "active" ? "activated" : "deactivated"}`,
      );
    } catch (error) {
      message.error(error?.data?.message || "Failed to update location status");
    }
  };

  const handleDeleteLocation = async (locationId) => {
    try {
      await deleteLocation(locationId).unwrap();
    } catch (error) {
      throw error;
    }
  };

  const handlePaginationChange = (newPage, newPageSize) => {
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      nextParams.set("page", newPage.toString());
      nextParams.set("limit", newPageSize.toString());
      return nextParams;
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleViewItems = async (location) => {
    setSelectedLocation(location);
    setViewModalOpen(true);
    try {
      await triggerGetLocationItems({
        locationId: location._id,
        page: itemPage,
        limit: itemLimit,
      }).unwrap();
    } catch (error) {
      message.error(error?.data?.message || "Failed to load location items");
    }
  };

  const handleSearchChange = (value) => {
    const searchValue =
      typeof value === "string"
        ? value.trim()
        : value?.target?.value?.trim() || "";
    const nextParams = new URLSearchParams(searchParams);
    if (searchValue) {
      nextParams.set("search", searchValue);
    } else {
      nextParams.delete("search");
    }
    nextParams.set("page", "1");
    setSearchParams(nextParams);
  };

  const handleItemPaginationChange = async (newPage, newPageSize) => {
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      nextParams.set("itemPage", newPage.toString());
      nextParams.set("itemLimit", newPageSize.toString());
      return nextParams;
    });

    if (!selectedLocation) return;

    try {
      await triggerGetLocationItems({
        locationId: selectedLocation._id,
        page: newPage,
        limit: newPageSize,
      }).unwrap();
    } catch (error) {
      message.error(error?.data?.message || "Failed to load location items");
    }
  };

  return (
    <div>
      <PageHeaderBar
        title="Locations"
        subtitle="Manage warehouse and storage locations"
        showSearch
        onSearch={handleSearchChange}
        rightNode={
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            Add Location
          </Button>
        }
      />

      <LocationFormModal
        open={isModalOpen}
        isLoading={createLoading}
        onOk={handleAddLocation}
        onCancel={handleCloseModal}
        form={form}
      />

      <LocationTable
        data={locationsResponse.data}
        loading={locationsLoading}
        pagination={locationsResponse.pagination}
        onPaginationChange={handlePaginationChange}
        onStatusChange={handleToggleStatus}
        onDelete={handleDeleteLocation}
        onViewItems={handleViewItems}
        statusLoading={statusLoading}
        deleteLoading={deleteLoading}
      />

      <ViewLocationItem
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        title={`Items in ${selectedLocation?.name || "Location"}`}
        data={locationItems.data}
        loading={locationItemsLoading}
        columns={itemColumns}
        emptyText="No items found in this location"
        entityName="items"
        pagination={locationItems.pagination}
        onPaginationChange={handleItemPaginationChange}
      />
    </div>
  );
};

export default LocationsPage;
