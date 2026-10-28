import { useCallback, useState, type ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ConfirmOptions {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

interface PromptOptions extends ConfirmOptions {
  inputLabel?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}

type DialogState =
  | {
      kind: "confirm";
      options: ConfirmOptions;
      resolve: (value: boolean) => void;
    }
  | {
      kind: "prompt";
      options: PromptOptions;
      resolve: (value: string | null) => void;
    }
  | null;

export function useConfirmDialog() {
  const [state, setState] = useState<DialogState>(null);
  const [input, setInput] = useState("");

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setState({ kind: "confirm", options, resolve });
      }),
    [],
  );

  const prompt = useCallback(
    (options: PromptOptions) =>
      new Promise<string | null>((resolve) => {
        setInput(options.defaultValue ?? "");
        setState({ kind: "prompt", options, resolve });
      }),
    [],
  );

  const close = (value: boolean | string | null) => {
    state?.resolve(value as never);
    setState(null);
  };

  const dialog = (
    <AlertDialog
      open={state !== null}
      onOpenChange={(open) => {
        if (!open) close(state?.kind === "prompt" ? null : false);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{state?.options.title}</AlertDialogTitle>
          {state?.options.description ? (
            <AlertDialogDescription asChild>
              <div className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {state.options.description}
              </div>
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>

        {state?.kind === "prompt" ? (
          <div className="space-y-2">
            {state.options.inputLabel ? (
              <Label htmlFor="confirm-dialog-input">{state.options.inputLabel}</Label>
            ) : null}
            <Input
              id="confirm-dialog-input"
              autoFocus
              value={input}
              placeholder={state.options.placeholder}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => close(state?.kind === "prompt" ? null : false)}>
            {state?.options.cancelLabel ?? "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              state?.options.destructive &&
                buttonVariants({ variant: "destructive" }),
            )}
            onClick={(event) => {
              if (
                state?.kind === "prompt" &&
                state.options.required !== false &&
                !input.trim()
              ) {
                event.preventDefault();
                return;
              }
              close(state?.kind === "prompt" ? input.trim() : true);
            }}
          >
            {state?.options.confirmLabel ?? "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { confirm, prompt, dialog };
}
