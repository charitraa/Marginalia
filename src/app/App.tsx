import ScrollToTop from "@/components/common/ScrollToTop";
import Providers from "./providers";
import AppRoutes from "./routes";

const App = () => (
  <Providers>
    <ScrollToTop />
    <AppRoutes />
  </Providers>
);

export default App;
