import { PartnerProfile } from "@/types";
import AuthForm from "@/components/forms/AuthForm";

interface AuthPageProps {
  mode: "login" | "register";
  onSuccess: (partner: PartnerProfile) => void;
  onSwitch: () => void;
  onBack: () => void;
}

export default function AuthPage({
  mode,
  onSuccess,
  onSwitch,
  onBack,
}: AuthPageProps) {
  return (
    <AuthForm
      mode={mode}
      onSuccess={onSuccess}
      onSwitch={onSwitch}
      onBack={onBack}
    />
  );
}
