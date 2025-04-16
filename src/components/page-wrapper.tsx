import { ReactNode } from 'react';

//bg-slate-500
export default function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col pt-2 px-4 space-y-2 bg-colorGrispalido flex-grow pb-4 text-black">
      {children}
      
    </div>
  );
}