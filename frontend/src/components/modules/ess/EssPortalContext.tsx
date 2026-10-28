import { createContext, useContext, type ReactNode } from "react";

export type EssBasePath = "/employee" | "/admin" | "/superadmin";
export type EssViewerRole = "employee" | "admin" | "superadmin";

type EssPortalValue = {
  basePath: EssBasePath;
  viewerRole: EssViewerRole;
};

const EssPortalContext = createContext<EssPortalValue>({
  basePath: "/employee",
  viewerRole: "employee",
});

export function EssPortalProvider({
  basePath,
  viewerRole,
  children,
}: EssPortalValue & { children: ReactNode }) {
  return (
    <EssPortalContext.Provider value={{ basePath, viewerRole }}>
      {children}
    </EssPortalContext.Provider>
  );
}

export function useEssPortal(): EssPortalValue {
  return useContext(EssPortalContext);
}

export function essPortalPath(
  basePath: EssBasePath,
): "/employee/ess" | "/admin/my-ess" | "/superadmin/my-ess" {
  if (basePath === "/employee") return "/employee/ess";
  if (basePath === "/admin") return "/admin/my-ess";
  return "/superadmin/my-ess";
}

export function myRequestsPath(
  basePath: EssBasePath,
): "/employee/my-requests" | "/admin/my-requests" | "/superadmin/my-requests" {
  if (basePath === "/employee") return "/employee/my-requests";
  if (basePath === "/admin") return "/admin/my-requests";
  return "/superadmin/my-requests";
}

export function myRequestModulePath(
  basePath: EssBasePath,
):
  | "/employee/my-requests/$module"
  | "/admin/my-requests/$module"
  | "/superadmin/my-requests/$module" {
  if (basePath === "/employee") return "/employee/my-requests/$module";
  if (basePath === "/admin") return "/admin/my-requests/$module";
  return "/superadmin/my-requests/$module";
}
