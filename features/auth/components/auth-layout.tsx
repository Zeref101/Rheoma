import Image from "next/image";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-18">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-medium">
          <Image alt="logo" src={"/logos/logo.svg"} width={30} height={30} /> Rheoma
        </div>
      </div>
      {children}
    </div>
  );
};
