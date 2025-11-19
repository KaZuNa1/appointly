import { CheckCircle } from "lucide-react";

export default function BookingSummary({ providerName, serviceName }: any) {
  return (
    <div className="text-center mb-10">
      <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Амжилттай цаг захиаллаа!
      </h1>
      <p className="text-gray-600 text-lg">
        {providerName} — <span className="font-medium">{serviceName}</span>
      </p>
    </div>
  );
}
