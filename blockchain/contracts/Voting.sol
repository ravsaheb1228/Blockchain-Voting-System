// Voting.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Voting {

    // Candidate information
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    // Store all candidates
    Candidate[] public candidates;

    // Track whether an address has already voted
    mapping(address => bool) public hasVoted;

    // Add candidates when deploying the contract
    constructor() {
        candidates.push(Candidate(1, "Candidate A", 0));
        candidates.push(Candidate(2, "Candidate B", 0));
        candidates.push(Candidate(3, "Candidate C", 0));
    }

    // Cast a vote
    function vote(uint256 candidateId) public {

        // Prevent the same wallet from voting twice
        require(!hasVoted[msg.sender], "You have already voted");

        // Check that candidate exists
        require(
            candidateId > 0 && candidateId <= candidates.length,
            "Invalid candidate"
        );

        // Increase candidate's vote count
        candidates[candidateId - 1].voteCount++;

        // Mark this wallet as having voted
        hasVoted[msg.sender] = true;
    }

    // Get total number of candidates
    function getCandidateCount() public view returns (uint256) {
        return candidates.length;
    }

    // Get candidate information
    function getCandidate(uint256 candidateId)
        public
        view
        returns (
            uint256 id,
            string memory name,
            uint256 voteCount
        )
    {
        require(
            candidateId > 0 && candidateId <= candidates.length,
            "Invalid candidate"
        );

        Candidate memory candidate = candidates[candidateId - 1];

        return (
            candidate.id,
            candidate.name,
            candidate.voteCount
        );
    }
}