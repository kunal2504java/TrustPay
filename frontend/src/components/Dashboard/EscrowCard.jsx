export default function EscrowCard({ escrow, onClick }) {
  const statusColors = {
    HELD: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    RELEASED: 'bg-green-500/20 text-green-300 border-green-500/30',
    DISPUTED: 'bg-red-500/20 text-red-300 border-red-500/30'
  };

  return (
    <div
      onClick={onClick}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl p-6 hover:bg-white/10 hover:shadow-2xl transition-all cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-white text-lg">{escrow.description}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[escrow.status]}`}>
          {escrow.status}
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-2">To: {escrow.payer_vpa}</p>
      <p className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
        ₹{escrow.amount.toLocaleString('en-IN')}
      </p>
    </div>
  );
}
