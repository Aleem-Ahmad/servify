import ProviderNavbar from "@/components/providerDashboard/NavBar/NavBar";

export default function DashboardLayout({ children }) {
  return (
    <div className="provider-dashboard">
      <ProviderNavbar />
      <div className="provider-content">{children}</div>
    </div>
  );
}