type Props = {
  children: React.ReactNode;
};

export default function Card({ children }: Props) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-6 shadow-lg">
      {children}
    </div>
  );
}