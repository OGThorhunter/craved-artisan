
import NavHeader from './NavHeader';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="content-wrapper">
      <NavHeader />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
}; 