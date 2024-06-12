import { ReactNode } from 'react';

interface Props {
  title: string | ReactNode;
  description?: string | ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export default function Card({ 
  title, 
  description = null, 
  footer = null, 
  children 
}: Props) {
  return (
    <div className="w-full max-w-3xl m-auto my-8 border rounded-md p border-zinc-700">
      <div className="px-5 py-4">
        <h3 className="mb-1 text-2xl font-medium">{title}</h3>
        {description ? <p className="text-zinc-300">{description}</p> : null}
        {children}
      </div>
      {footer && <div className="p-4 border-t rounded-b-md border-zinc-700 bg-zinc-900 text-zinc-500">{footer}</div>}
    </div>
  );
}
