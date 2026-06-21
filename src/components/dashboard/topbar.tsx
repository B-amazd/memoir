import { UserButton } from "@clerk/nextjs";

export function Topbar() {
  return (
    <header className="border-b h-16 flex items-center justify-end px-6">
      <UserButton />
    </header>
  );
}