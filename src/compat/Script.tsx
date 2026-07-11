import type { ReactNode, ScriptHTMLAttributes } from "react";

type ScriptProps = ScriptHTMLAttributes<HTMLScriptElement> & {
  strategy?: string;
  children?: ReactNode;
};

export default function Script({ strategy: _strategy, ...props }: ScriptProps) {
  return <script {...props} />;
}
