export default function DashboardHeader({ user }: { user: any }) {
  return (
    <div className="mb-10">
      <h1 className="text-3xl font-bold text-gray-900">
        Сайн уу, {user.name} 👋
      </h1>
      <p className="text-gray-600 mt-2">
        Таны цаг захиалгын мэдээллийн самбар
      </p>
    </div>
  );
}
