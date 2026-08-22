# 🗳️ Blockchain-Based Voting System

A simple **blockchain-based voting application** built using **Solidity, Hardhat, React, Vite, ethers.js, and MetaMask**.

The project demonstrates how blockchain and smart contracts can be used to securely record votes and prevent duplicate voting from the same wallet address.

> **Note:** This is an educational/demo project running on a local Hardhat blockchain. It is not designed for real-world elections.

---

## 📌 About the Project

The Blockchain Voting System allows users to:

* Connect their MetaMask wallet
* View available candidates
* Cast a vote for a candidate
* Store the vote through a Solidity smart contract
* Prevent the same wallet from voting multiple times
* View updated vote counts

The voting logic is handled by the **smart contract**, while the React application provides the user interface.

---

## ✨ Features

* 🔐 Wallet-based voter identification
* 🗳️ Candidate selection and voting
* ⛓️ Blockchain-based vote recording
* 🚫 Duplicate voting prevention
* 📊 Live vote count display
* 🔒 Smart contract validation
* ⚡ Local blockchain using Hardhat
* 🦊 MetaMask integration

---

## 🏗️ Project Structure

```text
blockchain-voting/
│
├── blockchain/
│   ├── contracts/
│   │   └── Voting.sol
│   │
│   ├── scripts/
│   │   └── deploy.ts
│   │
│   ├── hardhat.config.ts
│   ├── package.json
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── contract.js
│   │   └── ...
│   │
│   ├── package.json
│   └── ...
│
└── README.md
```

---

## 🛠️ Tech Stack

### Blockchain

* **Solidity** — Smart Contract
* **Hardhat 3** — Blockchain development environment
* **Hardhat Network** — Local blockchain
* **ethers.js v6** — Blockchain interaction
* **TypeScript** — Deployment and configuration

### Frontend

* **React.js** — User interface
* **Vite** — Development server and build tool
* **ethers.js v6** — Smart contract interaction
* **MetaMask** — Wallet and transaction confirmation
* **Inline CSS** — Application styling

---

## ⚙️ How It Works

```text
User
  ↓
React Voting Application
  ↓
MetaMask
  ↓
ethers.js
  ↓
Voting Smart Contract
  ↓
Hardhat Blockchain
  ↓
Vote Recorded
  ↓
Updated Results
```

### Voting Process

1. User opens the voting application.
2. User connects their MetaMask wallet.
3. The application loads candidates from the smart contract.
4. User selects a candidate.
5. MetaMask asks the user to confirm the transaction.
6. The smart contract validates the vote.
7. The vote count is increased on the blockchain.
8. The wallet is marked as having voted.
9. The same wallet cannot vote again.

---

## 📜 Smart Contract

The main smart contract is:

```text
blockchain/contracts/Voting.sol
```

The contract contains:

### Candidate Structure

Each candidate stores:

* Candidate ID
* Candidate name
* Vote count

### Duplicate Vote Prevention

The contract uses:

```solidity
mapping(address => bool) public hasVoted;
```

This records whether a wallet address has already voted.

If the same wallet attempts to vote again, the transaction is rejected.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/blockchain-voting.git
```

```bash
cd blockchain-voting
```

---

# ⛓️ Blockchain Setup

### 2. Open the Blockchain Folder

```bash
cd blockchain
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Local Hardhat Blockchain

```bash
npx hardhat node
```

Keep this terminal running.

The local blockchain will run on:

```text
http://127.0.0.1:8545
```

The default Hardhat network uses:

```text
Chain ID: 31337
```

---

### 5. Deploy the Smart Contract

Open another terminal:

```bash
cd blockchain
```

Then run:

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

You should see something similar to:

```text
Voting contract deployed to: 0x...
```

Copy the deployed contract address and update it in:

```text
frontend/src/contract.js
```

---

# 💻 Frontend Setup

### 6. Open the Frontend Folder

```bash
cd frontend
```

### 7. Install Dependencies

```bash
npm install
```

### 8. Start the React Application

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

---

## 🦊 MetaMask Setup

To use the application locally:

1. Install the MetaMask browser extension.
2. Add/connect the local Hardhat network.
3. Use one of the test accounts/private keys provided by Hardhat.
4. Make sure MetaMask is connected to:

```text
Network: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
```

> Never use real funds or real private keys for this project.

---

## 🧪 Demo

The application provides three candidates:

```text
Candidate A
Candidate B
Candidate C
```

Example voting flow:

```text
Connect Wallet
      ↓
Select Candidate
      ↓
Click Vote
      ↓
Confirm Transaction
      ↓
Blockchain Processes Vote
      ↓
Vote Count Updated
```

If the same wallet tries to vote again, the smart contract rejects the transaction.

---

## 📸 Screenshots

Add your project screenshots here.

### Voting Page

![Voting Page](screenshots/voting-page.png)

### MetaMask Transaction

![MetaMask Transaction](screenshots/metamask.png)

### Voting Results

![Voting Results](screenshots/results.png)

> Replace the image paths with your actual screenshot locations.

---

## 🔐 Security & Limitations

This project is intended for **learning and demonstration purposes**.

### Current Limitations

* One wallet address represents one voter.
* A person could theoretically use multiple wallets.
* Candidates are fixed when the contract is deployed.
* No admin/owner system is implemented.
* No voting start/end time is implemented.
* The project currently runs on a local Hardhat blockchain.
* It is not deployed to a public testnet or mainnet.
* Voter identity is not verified.

Therefore, this project should **not be used for real-world elections** in its current form.

---

## 🔮 Future Improvements

Possible improvements include:

* 👤 Voter identity verification
* 👨‍💼 Admin dashboard
* ⏰ Voting start and end time
* 📢 Smart contract events
* ➕ Dynamic candidate management
* 🌐 Public testnet deployment
* 🔍 Better election auditing
* 🔐 Stronger voter authentication

---

## 🎯 Learning Objectives

This project demonstrates:

* Smart contract development with Solidity
* Blockchain fundamentals
* Local blockchain development using Hardhat
* MetaMask wallet integration
* ethers.js contract interaction
* React and blockchain integration
* Blockchain transaction handling
* Smart contract-based voting rules

---

## 👨‍💻 Author

**Ravsaheb Khairnar**

MSc Computer Science

---

## ⭐ Project Status

**Educational / Demo Project**

Built to demonstrate the practical use of **Blockchain and Smart Contracts in Voting Systems**.

---

## 📄 License

This project is available for educational and learning purposes.
