// Layout for pages with top navbar + content (customer-facing)
import Navbar from "../components/layout/Navbar";
import { Outlet } from "react-router-dom";

export default function CustomerLayout() {
  return (
    <>
      <Navbar />
      <main className="main-content-full">
        <Outlet />
      </main>
    </>
  );
}
