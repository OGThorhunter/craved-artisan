export default function Section({ 
  title, 
  right, 
  children 
}: {
  title?: string; 
  right?: React.ReactNode; 
  children: React.ReactNode; 
}) {
  return (
    <section className="container-page my-6">
      {(title || right) && (
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div>{right}</div>
        </div>
      )}
      {children}
    </section>
  );
}

