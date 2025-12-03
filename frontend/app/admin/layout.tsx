import AdminLayout from '../../components/admin/AdminLayout';

export const metadata = {
  title: 'CosM. - Admin',
  description: 'CosM. - Admin',
};

export default function RootAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminLayout>{children}</AdminLayout>
    </>
  );
}