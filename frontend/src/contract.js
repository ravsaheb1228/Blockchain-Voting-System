export const CONTRACT_ADDRESS =
  "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export const CONTRACT_ABI = [
  {
    inputs: [],
    name: "getCandidateCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "candidateId",
        type: "uint256"
      }
    ],
    name: "getCandidate",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "name",
        type: "string"
      },
      {
        internalType: "uint256",
        name: "voteCount",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "candidateId",
        type: "uint256"
      }
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "hasVoted",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
];