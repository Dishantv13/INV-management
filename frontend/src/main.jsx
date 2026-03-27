import '@ant-design/v5-patch-for-react-19';
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import "antd/dist/reset.css";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
);
