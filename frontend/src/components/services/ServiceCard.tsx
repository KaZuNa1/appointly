import type { ComponentType } from "react";

interface ServiceCardProps {
  name: string;
  desc: string;
  slug: string;
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  name,
  desc,
  icon: Icon,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 cursor-pointer group border border-gray-100 hover:border-indigo-200"
    >
      <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
        <Icon className="w-7 h-7 text-indigo-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{name}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  );
};

export default ServiceCard;
