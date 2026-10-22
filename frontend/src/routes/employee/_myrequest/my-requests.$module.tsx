import { createFileRoute, Navigate, useParams } from "@tanstack/react-router";
import { MyRequestModulePage } from "@/components/modules/my-request/MyRequestModulePage";
import {
  MY_REQUEST_MODULES,
  parseMyRequestModule,
} from "@/components/modules/my-request/myRequestModules";

export const Route = createFileRoute("/employee/_myrequest/my-requests/$module")({
  head: ({ params }) => {
    const config = MY_REQUEST_MODULES[parseMyRequestModule(params.module) ?? "payroll"];
    return {
      meta: [
        { title: `${config.label} Requests — Oxford Suites Makati HRMS` },
        {
          name: "description",
          content: config.description,
        },
        { property: "og:title", content: `${config.label} Requests — Oxford Suites Makati HRMS` },
        { property: "og:description", content: config.description },
      ],
    };
  },
  component: MyRequestModuleRoute,
});

function MyRequestModuleRoute() {
  const params = useParams({ strict: false }) as { module?: string };
  const moduleId = parseMyRequestModule(params.module);

  if (!moduleId) {
    return <Navigate to="/employee/my-requests" replace />;
  }

  return <MyRequestModulePage moduleId={moduleId} />;
}
