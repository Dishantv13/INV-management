import { useState } from "react";
import { Form, message, Button } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageHeaderBar from "../components/PageHeaderBar";
import LocationFormModal from "../components/LocationFormModal";
import LocationTable from "../components/LocationTable";
import {
  useGetLocationsQuery,
  useCreateLocationMutation,
  useUpdateLocationStatusMutation,
  useDeleteLocationMutation,
} from "../services/locationApi";
import { ROUTE_URL } from "../enum/url";

const LocationsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
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
      nextParams.delete("itemPage");
      nextParams.delete("itemLimit");
      return nextParams;
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleViewItems = (location) => {
    navigate(ROUTE_URL.LOCATION_ITEMS(location._id));
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
    nextParams.delete("itemPage");
    nextParams.delete("itemLimit");
    setSearchParams(nextParams);
  };

  return (
    <div>
      <PageHeaderBar
        title="Locations"
        subtitle="Manage warehouse and storage locations"
        showSearch
        onSearch={handleSearchChange}
        defaultSearchValue={search}
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
    </div>
  );
};

export default LocationsPage;
