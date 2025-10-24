function Pill({ children }: { children: React.ReactNode }) {
    return <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">{children}</span>;
}
export default Pill;