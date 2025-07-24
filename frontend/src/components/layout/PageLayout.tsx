import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./footer/Footer";

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow px-4 md:px-8">{children}</main>
      <Footer />
    </div>
  );
};

export default PageLayout;
