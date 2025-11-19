import React from "react";
import ServiceCard from "./ServiceCard";
import type { Service } from "./servicesData";

interface ServiceGridProps {
  services: Service[];
  onServiceClick: (slug: string) => void;
}

const ServiceGrid: React.FC<ServiceGridProps> = ({
  services,
  onServiceClick,
}) => {
  if (services.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">Үйлчилгээ олдсонгүй</p>
        <p className="text-gray-400 text-sm mt-2">Өөр үг хайж үзнэ үү</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {services.map((service) => (
        <ServiceCard
          key={service.slug}
          name={service.name}
          desc={service.desc}
          slug={service.slug}
          icon={service.icon}
          onClick={() => onServiceClick(service.slug)}
        />
      ))}
    </div>
  );
};

export default ServiceGrid;
