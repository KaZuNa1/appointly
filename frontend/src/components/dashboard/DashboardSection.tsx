export default function DashboardSection({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold mb-4 text-gray-900">{title}</h2>
      {children}
    </div>
  );
}
