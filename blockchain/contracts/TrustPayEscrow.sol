// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TrustPayEscrow
 * @dev Escrow contract for TrustPay - stores immutable proof of transactions
 * @notice This contract does NOT hold funds - it only stores transaction proofs
 */
contract TrustPayEscrow {
    
    // Escrow status enum
    enum EscrowStatus { 
        INITIATED,      // Escrow created
        HELD,           // Funds received and held
        RELEASED,       // Funds released to payee
        REFUNDED,       // Funds refunded to payer
        DISPUTED        // Dispute raised
    }
    
    // Escrow struct
    struct Escrow {
        string escrowId;           // UUID from backend
        address creator;           // Backend wallet address
        bytes32 metadataHash;      // Hash of escrow metadata
        uint256 amount;            // Amount in paise
        EscrowStatus status;       // Current status
        uint256 createdAt;         // Creation timestamp
        uint256 updatedAt;         // Last update timestamp
        string setuTxnId;          // Setu transaction ID
        bool exists;               // Check if escrow exists
    }
    
    // Mappings
    mapping(string => Escrow) public escrows;
    mapping(string => bool) public escrowExists;
    
    // Events
    event EscrowCreated(
        string indexed escrowId,
        bytes32 metadataHash,
        uint256 amount,
        uint256 timestamp
    );
    
    event EscrowHeld(
        string indexed escrowId,
        string setuTxnId,
        uint256 timestamp
    );
    
    event EscrowReleased(
        string indexed escrowId,
        uint256 timestamp
    );
    
    event EscrowRefunded(
        string indexed escrowId,
        uint256 timestamp
    );
    
    event EscrowDisputed(
        string indexed escrowId,
        uint256 timestamp
    );
    
    // Modifiers
    modifier onlyCreator(string memory escrowId) {
        require(escrows[escrowId].creator == msg.sender, "Not authorized");
        _;
    }
    
    modifier escrowMustExist(string memory escrowId) {
        require(escrowExists[escrowId], "Escrow does not exist");
        _;
    }
    
    /**
     * @dev Create a new escrow record
     * @param escrowId Unique escrow ID from backend
     * @param metadataHash Hash of escrow metadata (payer, payee, description)
     * @param amount Amount in paise
     */
    function createEscrow(
        string memory escrowId,
        bytes32 metadataHash,
        uint256 amount
    ) external {
        require(!escrowExists[escrowId], "Escrow already exists");
        require(amount > 0, "Amount must be greater than 0");
        
        escrows[escrowId] = Escrow({
            escrowId: escrowId,
            creator: msg.sender,
            metadataHash: metadataHash,
            amount: amount,
            status: EscrowStatus.INITIATED,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            setuTxnId: "",
            exists: true
        });
        
        escrowExists[escrowId] = true;
        
        emit EscrowCreated(escrowId, metadataHash, amount, block.timestamp);
    }
    
    /**
     * @dev Mark escrow as held (funds received)
     * @param escrowId Escrow ID
     * @param setuTxnId Setu transaction ID
     */
    function markHeld(
        string memory escrowId,
        string memory setuTxnId
    ) external onlyCreator(escrowId) escrowMustExist(escrowId) {
        require(
            escrows[escrowId].status == EscrowStatus.INITIATED,
            "Invalid status transition"
        );
        
        escrows[escrowId].status = EscrowStatus.HELD;
        escrows[escrowId].setuTxnId = setuTxnId;
        escrows[escrowId].updatedAt = block.timestamp;
        
        emit EscrowHeld(escrowId, setuTxnId, block.timestamp);
    }
    
    /**
     * @dev Release escrow (funds sent to payee)
     * @param escrowId Escrow ID
     */
    function releaseEscrow(
        string memory escrowId
    ) external onlyCreator(escrowId) escrowMustExist(escrowId) {
        require(
            escrows[escrowId].status == EscrowStatus.HELD,
            "Escrow must be in HELD status"
        );
        
        escrows[escrowId].status = EscrowStatus.RELEASED;
        escrows[escrowId].updatedAt = block.timestamp;
        
        emit EscrowReleased(escrowId, block.timestamp);
    }
    
    /**
     * @dev Refund escrow (funds returned to payer)
     * @param escrowId Escrow ID
     */
    function refundEscrow(
        string memory escrowId
    ) external onlyCreator(escrowId) escrowMustExist(escrowId) {
        require(
            escrows[escrowId].status == EscrowStatus.HELD ||
            escrows[escrowId].status == EscrowStatus.DISPUTED,
            "Invalid status for refund"
        );
        
        escrows[escrowId].status = EscrowStatus.REFUNDED;
        escrows[escrowId].updatedAt = block.timestamp;
        
        emit EscrowRefunded(escrowId, block.timestamp);
    }
    
    /**
     * @dev Mark escrow as disputed
     * @param escrowId Escrow ID
     */
    function markDisputed(
        string memory escrowId
    ) external onlyCreator(escrowId) escrowMustExist(escrowId) {
        require(
            escrows[escrowId].status == EscrowStatus.HELD,
            "Can only dispute HELD escrows"
        );
        
        escrows[escrowId].status = EscrowStatus.DISPUTED;
        escrows[escrowId].updatedAt = block.timestamp;
        
        emit EscrowDisputed(escrowId, block.timestamp);
    }
    
    /**
     * @dev Get escrow details
     * @param escrowId Escrow ID
     */
    function getEscrow(string memory escrowId) 
        external 
        view 
        escrowMustExist(escrowId)
        returns (
            bytes32 metadataHash,
            uint256 amount,
            EscrowStatus status,
            uint256 createdAt,
            uint256 updatedAt,
            string memory setuTxnId
        ) 
    {
        Escrow memory e = escrows[escrowId];
        return (
            e.metadataHash,
            e.amount,
            e.status,
            e.createdAt,
            e.updatedAt,
            e.setuTxnId
        );
    }
    
    /**
     * @dev Verify escrow metadata
     * @param escrowId Escrow ID
     * @param metadataHash Hash to verify
     */
    function verifyMetadata(
        string memory escrowId,
        bytes32 metadataHash
    ) external view escrowMustExist(escrowId) returns (bool) {
        return escrows[escrowId].metadataHash == metadataHash;
    }
}
