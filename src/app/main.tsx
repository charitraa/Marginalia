import { createRoot } from "react-dom/client";
import "@/styles/global.css";
import { migrateLegacyStorage } from "@/lib/storage";
import { registerServiceWorker } from "@/lib/pwa";
import App from "./App";

// Before anything reads localStorage, including next-themes.
migrateLegacyStorage();

createRoot(document.getElementById("root")!).render(<App />);

// Offline support and installability. A no-op in development.
registerServiceWorker();
