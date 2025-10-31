import { Link } from 'wouter';
import { Card } from '../shared/Card';

interface RoleCardProps {
  image: string;
  label: string;
  description: string;
  tagline: string;
  learnMoreHref: string;
  joinHref: string;
}

export function RoleCard({
  image,
  label,
  description,
  tagline,
  learnMoreHref,
  joinHref,
}: RoleCardProps) {
  const storeCTA = (cta: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastCTA', cta);
    }
  };

  return (
    <div className="bg-white border border-brand-charcoal text-brand-charcoal rounded-lg shadow-lg hover:scale-105 transition-all duration-300 text-center overflow-hidden flex flex-col">
      <div className="h-48 bg-brand-beige overflow-hidden">
        <img
          src={image}
          alt={label}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-semibold mb-1">{label}</h3>
        <p className="text-sm text-brand-grey italic mb-4">{tagline}</p>
        <p className="text-sm text-brand-grey mb-4 flex-1">{description}</p>
        <div className="flex flex-col gap-2">
          <Link
            href={learnMoreHref}
            className="text-brand-green hover:text-brand-green/80 text-sm font-medium transition-colors"
          >
            Learn More →
          </Link>
          <Link
            href={joinHref}
            onClick={() => storeCTA(label)}
            className="bg-brand-maroon text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#681b24] transition-colors"
          >
            Join Now
          </Link>
        </div>
      </div>
    </div>
  );
}

