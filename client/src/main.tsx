import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log('App starting...');

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
  console.log('App rendered successfully');
}
