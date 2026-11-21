import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export function PayrollTaxDocsPane() {
  return (
    <div className="flex items-center justify-center py-12">
      <Card className="max-w-sm text-center">
        <CardContent className="flex flex-col items-center gap-3 p-8">
          <FileText className="h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold">
            Tax documents coming soon
          </h3>
          <p className="text-sm text-muted-foreground">
            BIR 2316 and annual tax documents will be available here once
            generated.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
