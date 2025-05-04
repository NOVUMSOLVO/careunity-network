import { Switch, Route } from "wouter";
import { ProtectedRoute } from "./lib/protected-route";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import ServiceUsers from "@/pages/service-users";
import CarePlans from "@/pages/care-plans";
import Calendar from "@/pages/calendar";
import Reports from "@/pages/reports";
import Messages from "@/pages/messages";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/service-users" component={ServiceUsers} />
      <ProtectedRoute path="/care-plans" component={CarePlans} />
      <ProtectedRoute path="/calendar" component={Calendar} />
      <ProtectedRoute path="/reports" component={Reports} />
      <ProtectedRoute path="/messages" component={Messages} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return <Router />;
}

export default App;
