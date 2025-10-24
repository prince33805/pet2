function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">{title}</h2>
            {children}
        </section>
    );
}
export default Section;