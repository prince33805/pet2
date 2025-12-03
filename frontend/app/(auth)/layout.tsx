import { Lexend } from 'next/font/google'

const lexend = Lexend({ subsets: ['latin'], weight: ['400', '500', '700', '900'] })

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={lexend.className}>{children}</div>
    // <div className="max-w-7xl flex flex-col gap-12 items-start">{children}</div>
  );
}