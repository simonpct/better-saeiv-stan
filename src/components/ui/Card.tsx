/**
 * COMPOSANT CARD GÉNÉRIQUE
 */

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export default function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-gray-700 font-semibold">
          {title}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
