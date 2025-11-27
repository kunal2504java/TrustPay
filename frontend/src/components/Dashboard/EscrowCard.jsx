export default function EscrowCard({ escrow, onClick }) {
  const statusColors = {
    INITIATED: 'bg-[#2a2a2a] text-white border-[#333333]',
    HELD: 'bg-[#2a2a2a] text-white border-[#333333]',
    RELEASED: 'bg-[#2a2a2a] text-[#888888] border-[#333333]',
    DISPUTED: 'bg-[#2a2a2a] text-[#888888] border-[#333333]',
    REFUNDED: 'bg-[#2a2a2a] text-[#666666] border-[#333333]'
  };

  const copyToClipboard = (text, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div
      onClick={onClick}
      className="bg-[#242424] border border-[#2a2a2a] rounded-lg p-6 hover:border-[#333333] transition-all cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-white text-lg">{escrow.description}</h3>
          {escrow.escrow_name && (
            <p className="text-sm text-[#888888] mt-1">"{escrow.escrow_name}"</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded text-xs font-medium border ${statusColors[escrow.status]}`}>
          {escrow.status}
        </span>
      </div>
      
      {escrow.escrow_code && escrow.is_code_active && (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs text-[#666666]">Code:</span>
          <code className="px-2 py-1 bg-[#2a2a2a] border border-[#333333] rounded text-white font-mono text-sm font-semibold tracking-wider">
            {escrow.escrow_code}
          </code>
          <button
            onClick={(e) => copyToClipboard(escrow.escrow_code, e)}
            className="text-[#666666] hover:text-white transition-colors"
            title="Copy code"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      )}
      
      <p className="text-[#888888] text-sm mb-2">To: {escrow.payee_vpa || escrow.payer_vpa}</p>
      <p className="text-2xl font-bold text-white">
        ₹{escrow.amount.toLocaleString('en-IN')}
      </p>
    </div>
  );
}
