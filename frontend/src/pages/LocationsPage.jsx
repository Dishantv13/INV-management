import { useState } from "react";
import { Form, message } from "antd";
import PageHeaderBar from "../components/PageHeaderBar";
import LocationActionBar from "../components/LocationActionBar";
import LocationFormModal from "../components/LocationFormModal";
import LocationTable from "../components/LocationTable";
import {
  useGetLocationsQuery,
  useCreateLocationMutation,
  useUpdateLocationStatusMutation,
  useDeleteLocationMutation,
} from "../services/locationApi";

const LocationsPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const {
    data: locationsResponse = { data: [], pagination: null },
    isLoading: locationsLoading,
  } = useGetLocationsQuery({ page, limit });

  const [createLocation, { isLoading: createLoading }] = useCreateLocationMutation();
  const [updateLocationStatus, { isLoading: statusLoading }] = useUpdateLocationStatusMutation();
  const [deleteLocation, { isLoading: deleteLoading }] = useDeleteLocationMutation();

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
      message.success(`Location ${newStatus === "active" ? "activated" : "deactivated"}`);
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
    setPage(newPage);
    setLimit(newPageSize);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <div>
      <PageHeaderBar
        title="Locations"
        subtitle="Manage warehouse and storage locations"
      />

      <LocationActionBar onAddClick={() => setIsModalOpen(true)} />

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
        statusLoading={statusLoading}
        deleteLoading={deleteLoading}
      />
    </div>
  );
};

export default LocationsPage;
