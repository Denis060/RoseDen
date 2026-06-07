import { LucideIcon } from "lucide-react";

export function IconBox({ icon: Icon, tone = "burgundy" }: { icon: LucideIcon; tone?: "burgundy" | "gold" }) {
  return (
    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone === "gold" ? "bg-gold/15 text-gold" : "bg-burgundy/10 text-burgundy"}`}>
      <Icon size={20} strokeWidth={1.8} />
    </span>
  );
}
