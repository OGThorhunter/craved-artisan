import Card from "./Card";

export default function StatTile({ 
  label, 
  value, 
  delta 
}: {
  label: string; 
  value: string; 
  delta?: number;
}) {
  const color = delta! > 0 ? "text-green-700" : delta! < 0 ? "text-red-600" : "text-neutral-600";
  const sign = delta! > 0 ? "↑" : delta! < 0 ? "↓" : "•";
  
  return (
    <Card className="p-5">
      <div className="text-sm text-neutral-600">{label}</div>
      <div className="text-3xl font-semibold mt-1">{value}</div>
      {typeof delta === "number" && (
        <div className={`text-sm mt-1 ${color}`}>
          {sign} {Math.abs(delta).toFixed(1)}%
        </div>
      )}
    </Card>
  );
}

