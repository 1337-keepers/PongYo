import React from "react";
import NavBar from "./navbar/NavBar";
import SideBar from "./sidebar/SideBar";
import { useStateContext } from "@/contexts/state-context";
import TFA from "./TFA";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const {
    state: { authenicated },
  } = useStateContext();
  return (
    <>
      {authenicated === true && (
        <div className="flex h-screen w-screen flex-col">
          <NavBar />
          <div className="flex overflow-auto">
            <div className="hidden sm:block">
              <SideBar />
            </div>
            <div className="overflow-hidden">{children}</div>
          </div>
        </div>
      )}
      {authenicated === false && <>{children}</>}
      {authenicated === "otp" && (
        <>
          <TFA />
        </>
      )}
    </>
  );
}