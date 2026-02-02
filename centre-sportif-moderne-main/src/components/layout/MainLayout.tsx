import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const MainLayout = ({ children, title, subtitle }: MainLayoutProps) => {
  return (
    <>
      <Header title={title} subtitle={subtitle} />
      <main className="p-8">
        {children}
      </main>
    </>
  );
};

export default MainLayout;
