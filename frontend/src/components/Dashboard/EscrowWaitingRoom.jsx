import { useState, useEffect } from 'react';
import { wsService } from '../../services/websocket';

export default function EscrowWaitingRoom({ escrow, onParticipantJoined, onClose }) {
  const [copied, setCopied] = useState(false);
  const [participantCount, setParticipantCount] = useState(1); // Creator is already in

  useEffect(() => {
    // Subscribe to escrow updates
    wsService.subscribe(escrow.id);

    // Listen for participant joined event
    const handleUpdate = (message) => {
      console.log('Escrow update received:', message);
      // The message structure is { type: 'escrow_update', data: { event_type: '...', ... } }
      const data = message.data || message;

      if (data.event_type === 'participant_joined' || (data.payee_id && data.payee_id !== escrow.payer_id)) {
        setParticipantCount(2);
        // Add a small delay for visual feedback before closing
        setTimeout(() => {
          onParticipantJoined();
        }, 1500);
      }
    };

    // Listen to specific escrow channel
    const unsubscribe = wsService.on(`escrow:${escrow.id}`, handleUpdate);

    // Also check if payee is already there (in case of refresh/re-mount)
    if (escrow.payee_id || (escrow.payee_vpa && escrow.payee_vpa !== '')) {
      // Note: payee_vpa is always present, so we rely on payee_id or WS event
      // If payee_id is present in escrow object, we can proceed
      if (escrow.payee_id) {
        setParticipantCount(2);
        setTimeout(() => {
          onParticipantJoined();
        }, 1000);
      }
    }

    return () => {
      unsubscribe();
      wsService.unsubscribe(escrow.id);
    };
  }, [escrow.id, onParticipantJoined, escrow.payee_id]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(escrow.escrow_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareCode = () => {
    const shareText = `Join my escrow "${escrow.escrow_name}" using code: ${escrow.escrow_code}\n\nAmount: ₹${(escrow.amount / 100).toFixed(2)}\nDescription: ${escrow.description}`;

    if (navigator.share) {
      navigator.share({
        title: 'Join Escrow',
        text: shareText,
      }).catch(() => {
        // Fallback to copy
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-black border border-neutral-800 rounded-xl max-w-lg w-full p-6 shadow-2xl my-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
            Waiting for Participant
          </h2>
          <p className="text-sm text-neutral-400">
            Share this code with the other party to join the escrow
          </p>
        </div>

        {/* Escrow Details */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 mb-4">
          <div className="text-center mb-4">
            <p className="text-xs text-neutral-500 mb-1">Escrow Name</p>
            <p className="text-xl font-semibold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
              {escrow.escrow_name}
            </p>
          </div>

          {/* Code Display */}
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 mb-4">
            <p className="text-xs text-neutral-400 text-center mb-2">Escrow Code</p>
            <div className="text-5xl font-bold text-center text-white font-mono tracking-widest mb-3">
              {escrow.escrow_code}
            </div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 rounded-lg transition-all text-sm"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={shareCode}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-neutral-200 text-black border border-neutral-700 rounded-lg transition-all text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-neutral-500 mb-1">Amount</p>
              <p className="text-white font-semibold">₹{(escrow.amount / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-neutral-500 mb-1">Payee UPI</p>
              <p className="text-white font-semibold text-xs break-all">{escrow.payee_vpa}</p>
            </div>
            <div className="col-span-2">
              <p className="text-neutral-500 mb-1">Description</p>
              <p className="text-neutral-300 text-xs">{escrow.description}</p>
            </div>
          </div>
        </div>

        {/* Participants Status */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Participants</h3>
            <span className="text-xs text-neutral-500">{participantCount}/2</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">You (Creator)</p>
                <p className="text-xs text-neutral-500">Joined</p>
              </div>
            </div>

            {participantCount >= 2 ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">Participant Joined</p>
                  <p className="text-xs text-green-400">Ready to proceed</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-neutral-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-neutral-400 font-medium text-sm">Waiting for participant...</p>
                  <p className="text-xs text-neutral-600">Share the code above</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 rounded-lg transition-all text-sm"
          >
            Cancel
          </button>
          {/* For testing - simulate someone joining */}
          <button
            onClick={() => {
              setParticipantCount(2);
              setTimeout(() => onParticipantJoined(), 1000);
            }}
            className="flex-1 px-4 py-2.5 bg-white hover:bg-neutral-200 text-black rounded-lg font-semibold transition-all text-sm"
          >
            Simulate Join (Test)
          </button>
        </div>

        <p className="text-center text-xs text-neutral-600 mt-3">
          The escrow will be created once both parties join
        </p>
      </div>
    </div>
  );
}
