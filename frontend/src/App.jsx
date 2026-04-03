import Dashboard from "./pages/Dashboard";
import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ItemListPage from "./pages/ItemListPage";
import StockAdjustmentPage from "./pages/StockAdjustmentPage";
import StockHistoryPage from "./pages/StockHistoryPage";
import LocationsPage from "./pages/LocationsPage";
import AddItemPage from "./pages/AddItemPage.jsx";
import LocationItemsPage from "./pages/LocationItemsPage.jsx";
import ItemDetailsPage from "./pages/ItemDetailsPage.jsx";
import ItemReportPage from "./pages/ItemReportPage.jsx";
import { Navigate } from "react-router-dom";
import { ROUTE_URL } from "./enum/url";

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path={ROUTE_URL.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTE_URL.ITEMS} element={<ItemListPage />} />
        <Route path={ROUTE_URL.ITEM_ADD} element={<AddItemPage />} />
        <Route path={ROUTE_URL.LOCATIONS} element={<LocationsPage />} />
        <Route
          path={ROUTE_URL.LOCATION_ITEMS()}
          element={<LocationItemsPage />}
        />
        <Route
          path={ROUTE_URL.ITEM_DETAILS()}
          element={<ItemDetailsPage />}
        />
        <Route
          path={ROUTE_URL.STOCK_ADJUSTMENT}
          element={<StockAdjustmentPage />}
        />
        <Route path={ROUTE_URL.STOCK_HISTORY} element={<StockHistoryPage />} />
        <Route path={ROUTE_URL.ITEM_REPORT} element={<ItemReportPage />} />
        <Route
          path={"*"}
          element={<Navigate to={ROUTE_URL.DASHBOARD} replace />}
        />
      </Routes>
    </AppLayout>
  );
}

export default App;
