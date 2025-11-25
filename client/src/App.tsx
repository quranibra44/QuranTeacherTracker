import { Switch, Route } from "wouter";
import { AppProvider } from "./lib/store";
import { Layout } from "./components/Layout";
import Tracking from "./pages/Tracking";
import Management from "./pages/Management";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <AppProvider>
      <Layout>
        <Switch>
          <Route path="/" component={Tracking} />
          <Route path="/management" component={Management} />
          <Route>
             <div className="text-center py-20">
               <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
               <p>The page you are looking for does not exist.</p>
             </div>
          </Route>
        </Switch>
      </Layout>
      <Toaster />
    </AppProvider>
  );
}

export default App;
