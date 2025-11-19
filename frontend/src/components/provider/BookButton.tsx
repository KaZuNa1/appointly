// /src/components/provider-profile/BookButton.tsx

import { Button } from "@/components/ui/button";

export default function BookButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <Button
      className="w-full h-12 text-lg"
      disabled={disabled}
      onClick={onClick}
    >
      Цаг захиалах
    </Button>
  );
}
