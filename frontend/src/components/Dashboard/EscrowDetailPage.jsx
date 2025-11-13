import { mockEscrows } from '../../data/mockEscrows';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '../Icons';

export default function EscrowDetailPage({ escrowId, setActivePage }) {
  const escrow = mockEscrows.find(e => e.id === escrowId);

  if (!escrow) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Escrow not found.</p>
        <button
          onClick={() => setActivePage('dashboard')}
          className="mt-4 text-indigo-600 hover:text-indigo-700 font-semibold"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleConfirmRelease = () => {
    alert('Release confirmed! Funds will be transferred to the payee.');
  };

  const handleRaiseDispute = () => {
    alert('Dispute raised! Our team will review this case.');
  };

  const statusColors = {
    HELD: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    RELEASED: 'bg-green-500/20 text-green-300 border-green-500/30',
    DISPUTED: 'bg-red-500/20 text-red-300 border-red-500/30'
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => setActivePage('dashboard')}
        className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 font-semibold mb-6"
      >
        <ArrowLeftIcon />
        <span>Back to Dashboard</span>
      </button>

      <h1 className="text-3xl font-bold text-white mb-8">Escrow Details</h1>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{escrow.description}</h2>
            <p className="text-gray-400 text-sm">ID: {escrow.id}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${statusColors[escrow.status]}`}>
            {escrow.status}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">Payee</p>
            <p className="font-semibold text-white">{escrow.payee_vpa}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Payer</p>
            <p className="font-semibold text-white">{escrow.payer_vpa}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Amount</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              ₹{escrow.amount.toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Created</p>
            <p className="font-semibold text-white">
              {new Date(escrow.created_at).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {escrow.status === 'HELD' && (
          <div className="flex space-x-4 pt-6 border-t border-white/10">
            <button
              onClick={handleConfirmRelease}
              className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              <CheckCircleIcon />
              <span>Confirm Release</span>
            </button>
            <button
              onClick={handleRaiseDispute}
              className="flex-1 flex items-center justify-center space-x-2 border-2 border-red-500 text-red-400 hover:bg-red-500/10 py-3 rounded-lg font-semibold transition-colors"
            >
              <XCircleIcon />
              <span>Raise Dispute</span>
            </button>
          </div>
        )}
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Timeline</h3>
        <div className="space-y-4">
          {escrow.timeline.map((event, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mt-1.5"></div>
              <div className="flex-1">
                <p className="font-semibold text-white">{event.event}</p>
                <p className="text-sm text-gray-400">
                  {new Date(event.timestamp).toLocaleString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
