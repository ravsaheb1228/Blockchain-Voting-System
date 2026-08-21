import { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract";

const HARDHAT_CHAIN_ID = "0x7a69";

function votedCandidateKey(account) {
  return `voted:${CONTRACT_ADDRESS}:${account.toLowerCase()}`;
}

function truncateAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function App() {
  const [account, setAccount] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedCandidateId, setVotedCandidateId] = useState(null);
  const [votingId, setVotingId] = useState(null);
  const [copied, setCopied] = useState(false);

  // =========================
  // STATUS HELPERS
  // =========================

  function setInfo(text) {
    setStatus({ type: "info", text });
  }

  function setSuccess(text) {
    setStatus({ type: "success", text });
  }

  function setError(text) {
    setStatus({ type: "error", text });
  }

  function setWarning(text) {
    setStatus({ type: "warning", text });
  }

  // =========================
  // SWITCH NETWORK
  // =========================

  async function switchToHardhatNetwork() {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: HARDHAT_CHAIN_ID }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: HARDHAT_CHAIN_ID,
              chainName: "Hardhat Local",
              rpcUrls: ["http://127.0.0.1:8545"],
              nativeCurrency: {
                name: "Ether",
                symbol: "ETH",
                decimals: 18,
              },
            },
          ],
        });
      } else {
        console.error(switchError);
        setError("Could not switch to Hardhat Local network.");
        return;
      }
    }

    await connectWallet();
  }

  // =========================
  // CONNECT WALLET
  // =========================

  async function connectWallet() {
    if (!window.ethereum) {
      setError("MetaMask is not installed.");
      return;
    }

    try {
      setLoading(true);
      setStatus(null);
      setWrongNetwork(false);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        setError("No MetaMask account found.");
        return;
      }

      const connectedAccount = accounts[0];

      console.log("Account:", connectedAccount);

      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      console.log("Chain ID:", chainId);

      if (chainId !== HARDHAT_CHAIN_ID) {
        setWarning(
          "Wrong network. Please select Hardhat Local (Chain ID 31337)."
        );

        setWrongNetwork(true);
        setAccount("");
        return;
      }

      const code = await window.ethereum.request({
        method: "eth_getCode",
        params: [CONTRACT_ADDRESS, "latest"],
      });

      console.log("Contract address:", CONTRACT_ADDRESS);
      console.log("Contract bytecode:", code);

      if (code === "0x") {
        setError(
          "Voting contract not found. Please deploy the contract again on Hardhat Local."
        );
        return;
      }

      setAccount(connectedAccount);

      const remembered = localStorage.getItem(
        votedCandidateKey(connectedAccount)
      );

      setVotedCandidateId(remembered ? Number(remembered) : null);

      await loadCandidates(connectedAccount);
    } catch (error) {
      console.error("Wallet connection error:", error);

      if (error.code === 4001) {
        setError("Connection request was rejected.");
      } else {
        setError(
          "Could not connect to blockchain. Check MetaMask and Hardhat."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // LOAD CANDIDATES
  // =========================

  async function loadCandidates(userAccount = account) {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed.");
      }

      const provider = new BrowserProvider(window.ethereum);

      const network = await provider.getNetwork();

      console.log("Connected network:", network);

      const contract = new Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      const count = await contract.getCandidateCount();

      console.log("Candidate count:", Number(count));

      const candidateList = [];

      for (let i = 1; i <= Number(count); i++) {
        const candidate = await contract.getCandidate(i);

        candidateList.push({
          id: Number(candidate[0]),
          name: candidate[1],
          voteCount: Number(candidate[2]),
        });
      }

      setCandidates(candidateList);

      if (userAccount) {
        const voted = await contract.hasVoted(userAccount);
        setHasVoted(voted);
      }

      setStatus(null);
    } catch (error) {
      console.error("loadCandidates error:", error);

      setError(
        "Could not load candidates from blockchain. Make sure Hardhat is running."
      );
    }
  }

  // =========================
  // VOTE
  // =========================

  async function vote(candidateId) {
    try {
      if (!window.ethereum) {
        setError("MetaMask is not installed.");
        return;
      }

      setVotingId(candidateId);

      setInfo("Please confirm the transaction in MetaMask...");

      const provider = new BrowserProvider(window.ethereum);

      const signer = await provider.getSigner();

      const contract = new Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      const transaction = await contract.vote(candidateId);

      setInfo("Transaction submitted. Waiting for confirmation...");

      await transaction.wait();

      setSuccess("Your vote was recorded on the blockchain!");

      setHasVoted(true);

      setVotedCandidateId(candidateId);

      localStorage.setItem(
        votedCandidateKey(account),
        String(candidateId)
      );

      await loadCandidates(account);
    } catch (error) {
      console.error("Voting error:", error);

      if (error.code === "ACTION_REJECTED" || error.code === 4001) {
        setError("Transaction was rejected.");
      } else if (error.reason) {
        setError(error.reason);
      } else {
        setError("Voting failed. Check MetaMask and try again.");
      }
    } finally {
      setVotingId(null);
    }
  }

  // =========================
  // COPY ADDRESS
  // =========================

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(account);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }

  // =========================
  // DISCONNECT
  // =========================

  async function disconnectWallet() {
    try {
      await window.ethereum.request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      });
    } catch (error) {
      console.warn(
        "wallet_revokePermissions not supported:",
        error
      );
    }

    setAccount("");
    setCandidates([]);
    setHasVoted(false);
    setVotedCandidateId(null);
    setVotingId(null);
    setWrongNetwork(false);
    setStatus(null);
  }

  // =========================
  // METAMASK EVENTS
  // =========================

  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        if (accounts.length > 0) {
          connectWallet();
        }
      })
      .catch(() => {});

    function handleAccountsChanged(accounts) {
      if (accounts.length === 0) {
        setAccount("");
        setCandidates([]);
        setHasVoted(false);
        setVotedCandidateId(null);
        setStatus(null);
      } else {
        connectWallet();
      }
    }

    function handleChainChanged() {
      window.location.reload();
    }

    window.ethereum.on(
      "accountsChanged",
      handleAccountsChanged
    );

    window.ethereum.on(
      "chainChanged",
      handleChainChanged
    );

    return () => {
      window.ethereum.removeListener(
        "accountsChanged",
        handleAccountsChanged
      );

      window.ethereum.removeListener(
        "chainChanged",
        handleChainChanged
      );
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================
  // CALCULATIONS
  // =========================

  const totalVotes = candidates.reduce(
    (sum, candidate) => sum + candidate.voteCount,
    0
  );

  // =========================
  // COLORS
  // =========================

  const colors = {
    background: "#eef3f8",
    card: "#ffffff",
    primary: "#2563eb",
    primaryDark: "#1d4ed8",
    success: "#16845b",
    successLight: "#e9f7f0",
    text: "#172033",
    secondaryText: "#667085",
    border: "#dfe5ec",
    softBlue: "#eff6ff",
    softGreen: "#edf8f3",
    softRed: "#fff1f1",
    softYellow: "#fff8e6",
  };

  // =========================
  // UI
  // =========================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.background,
        padding: "40px 20px",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: colors.text,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "760px",
          margin: "0 auto",
          background: colors.card,
          borderRadius: "24px",
          border: `1px solid ${colors.border}`,
          boxShadow: "0 16px 45px rgba(31, 41, 55, 0.08)",
          overflow: "hidden",
        }}
      >
        {/* =========================
            HEADER
        ========================= */}

        <div
          style={{
            padding: "34px 36px 30px",
            borderBottom: `1px solid ${colors.border}`,
            background:
              "linear-gradient(135deg, #ffffff 0%, #f7faff 100%)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "15px",
                background: "#eaf2ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: colors.primary,
                fontSize: "26px",
                flexShrink: 0,
              }}
            >
              ✓
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "29px",
                  fontWeight: 750,
                  color: "#111827",
                  letterSpacing: "-0.7px",
                }}
              >
                VoteChain
              </h1>

              <p
                style={{
                  margin: "5px 0 0",
                  fontSize: "14px",
                  color: colors.secondaryText,
                  fontWeight: 500,
                }}
              >
                Secure decentralized voting platform
              </p>
            </div>
          </div>
        </div>

        {/* =========================
            STATUS
        ========================= */}

        {status && (
          <div
            style={{
              margin: "24px 36px 0",
              padding: "13px 16px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "14px",
              fontWeight: 550,
              background:
                status.type === "success"
                  ? colors.softGreen
                  : status.type === "error"
                  ? colors.softRed
                  : status.type === "warning"
                  ? colors.softYellow
                  : colors.softBlue,
              color:
                status.type === "success"
                  ? "#126b49"
                  : status.type === "error"
                  ? "#b42318"
                  : status.type === "warning"
                  ? "#946200"
                  : "#1d4ed8",
              border:
                status.type === "success"
                  ? "1px solid #c8eadb"
                  : status.type === "error"
                  ? "1px solid #ffd2d2"
                  : status.type === "warning"
                  ? "1px solid #f5dfaa"
                  : "1px solid #d6e7ff",
            }}
          >
            <span
              style={{
                width: "23px",
                height: "23px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.7)",
                fontWeight: 700,
              }}
            >
              {status.type === "success"
                ? "✓"
                : status.type === "error"
                ? "!"
                : status.type === "warning"
                ? "!"
                : "i"}
            </span>

            <span>{status.text}</span>
          </div>
        )}

        {/* =========================
            NOT CONNECTED
        ========================= */}

        {!account ? (
          <div
            style={{
              padding: "58px 36px 62px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                margin: "0 auto 24px",
                borderRadius: "20px",
                background: colors.softBlue,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "30px",
                color: colors.primary,
                border: "1px solid #dbeafe",
              }}
            >
              ⛓
            </div>

            <h2
              style={{
                margin: 0,
                color: "#111827",
                fontSize: "25px",
                fontWeight: 750,
                letterSpacing: "-0.4px",
              }}
            >
              Connect your wallet
            </h2>

            <p
              style={{
                maxWidth: "440px",
                margin: "12px auto 28px",
                color: colors.secondaryText,
                fontSize: "15px",
                lineHeight: 1.7,
              }}
            >
              Connect MetaMask to participate in the
              decentralized election and cast your vote securely.
            </p>

            <button
              onClick={connectWallet}
              disabled={loading}
              style={{
                width: "100%",
                maxWidth: "420px",
                height: "50px",
                border: "none",
                borderRadius: "11px",
                background: loading
                  ? "#93b4ef"
                  : colors.primary,
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 650,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow:
                  "0 7px 18px rgba(37, 99, 235, 0.18)",
                transition: "0.2s",
              }}
            >
              {loading ? "Connecting..." : "Connect MetaMask"}
            </button>

            {wrongNetwork && (
              <button
                onClick={switchToHardhatNetwork}
                disabled={loading}
                style={{
                  width: "100%",
                  maxWidth: "420px",
                  height: "48px",
                  marginTop: "12px",
                  border: `1px solid ${colors.border}`,
                  borderRadius: "11px",
                  background: "#ffffff",
                  color: "#344054",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Switch to Hardhat Local
              </button>
            )}

            <div
              style={{
                margin: "26px auto 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                color: "#7b8494",
                fontSize: "13px",
              }}
            >
              <span>🔒</span>
              <span>Your wallet remains under your control.</span>
            </div>
          </div>
        ) : (
          <>
            {/* =========================
                CONNECTED ACCOUNT
            ========================= */}

            <div
              style={{
                margin: "28px 36px 0",
                padding: "15px 17px",
                borderRadius: "14px",
                background: "#f8fafc",
                border: `1px solid ${colors.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "15px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "11px",
                    background: colors.softGreen,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: colors.success,
                    fontSize: "17px",
                  }}
                >
                  ✓
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: colors.secondaryText,
                      marginBottom: "3px",
                    }}
                  >
                    Connected wallet
                  </div>

                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 650,
                      color: "#1f2937",
                    }}
                  >
                    {truncateAddress(account)}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "7px",
                }}
              >
                <button
                  onClick={copyAddress}
                  title="Copy address"
                  style={{
                    width: "38px",
                    height: "38px",
                    border: `1px solid ${colors.border}`,
                    background: "#ffffff",
                    borderRadius: "9px",
                    cursor: "pointer",
                    color: "#475467",
                    fontSize: "16px",
                  }}
                >
                  {copied ? "✓" : "⧉"}
                </button>

                <button
                  onClick={disconnectWallet}
                  title="Disconnect"
                  style={{
                    width: "38px",
                    height: "38px",
                    border: `1px solid ${colors.border}`,
                    background: "#ffffff",
                    borderRadius: "9px",
                    cursor: "pointer",
                    color: "#475467",
                    fontSize: "16px",
                  }}
                >
                  ↪
                </button>
              </div>
            </div>

            {/* =========================
                SECTION HEADER
            ========================= */}

            <div
              style={{
                margin: "34px 36px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    color: "#111827",
                    fontWeight: 720,
                  }}
                >
                  Election Candidates
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: colors.secondaryText,
                    fontSize: "13px",
                  }}
                >
                  Select one candidate to cast your vote.
                </p>
              </div>

              <button
                onClick={() => loadCandidates()}
                title="Refresh results"
                style={{
                  width: "40px",
                  height: "40px",
                  border: `1px solid ${colors.border}`,
                  background: "#ffffff",
                  borderRadius: "10px",
                  cursor: "pointer",
                  color: "#475467",
                  fontSize: "20px",
                }}
              >
                ↻
              </button>
            </div>

            {/* =========================
                CANDIDATES
            ========================= */}

            {candidates.length === 0 ? (
              <div
                style={{
                  margin: "0 36px",
                  padding: "35px",
                  textAlign: "center",
                  background: "#f8fafc",
                  borderRadius: "14px",
                  color: colors.secondaryText,
                }}
              >
                No candidates found.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  margin: "0 36px",
                }}
              >
                {candidates.map((candidate) => {
                  const percentage =
                    totalVotes > 0
                      ? Math.round(
                          (candidate.voteCount / totalVotes) * 100
                        )
                      : 0;

                  const isChosen =
                    votedCandidateId === candidate.id;

                  return (
                    <div
                      key={candidate.id}
                      style={{
                        padding: "20px",
                        borderRadius: "15px",
                        border: isChosen
                          ? "1px solid #a9dcc6"
                          : `1px solid ${colors.border}`,
                        background: isChosen
                          ? "#f5fbf8"
                          : "#ffffff",
                        boxShadow:
                          "0 3px 12px rgba(16, 24, 40, 0.03)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "15px",
                          marginBottom: "15px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "11px",
                              background: colors.softBlue,
                              color: colors.primary,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: "14px",
                            }}
                          >
                            {candidate.id}
                          </div>

                          <div>
                            <h3
                              style={{
                                margin: 0,
                                color: "#182230",
                                fontSize: "16px",
                                fontWeight: 680,
                              }}
                            >
                              {candidate.name}
                            </h3>

                            {isChosen && (
                              <span
                                style={{
                                  display: "inline-block",
                                  marginTop: "5px",
                                  padding: "3px 8px",
                                  borderRadius: "20px",
                                  background: colors.softGreen,
                                  color: colors.success,
                                  fontSize: "11px",
                                  fontWeight: 700,
                                }}
                              >
                                ✓ Your vote
                              </span>
                            )}
                          </div>
                        </div>

                        <div
                          style={{
                            textAlign: "right",
                            color: colors.secondaryText,
                            fontSize: "13px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <strong
                            style={{
                              color: "#344054",
                            }}
                          >
                            {candidate.voteCount}
                          </strong>{" "}
                          {candidate.voteCount === 1
                            ? "vote"
                            : "votes"}
                          <br />
                          <span>{percentage}%</span>
                        </div>
                      </div>

                      {/* Progress */}
                      <div
                        style={{
                          height: "7px",
                          background: "#edf1f5",
                          borderRadius: "20px",
                          overflow: "hidden",
                          marginBottom: "17px",
                        }}
                      >
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: "100%",
                            background:
                              "linear-gradient(90deg, #4f8df7, #2563eb)",
                            borderRadius: "20px",
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>

                      {/* Vote button */}
                      <button
                        onClick={() => vote(candidate.id)}
                        disabled={hasVoted || votingId !== null}
                        style={{
                          width: "100%",
                          height: "44px",
                          border: "none",
                          borderRadius: "9px",
                          background: hasVoted
                            ? "#e9edf2"
                            : colors.success,
                          color: hasVoted
                            ? "#667085"
                            : "#ffffff",
                          fontSize: "14px",
                          fontWeight: 650,
                          cursor:
                            hasVoted || votingId !== null
                              ? "not-allowed"
                              : "pointer",
                          transition: "0.2s",
                        }}
                      >
                        {hasVoted
                          ? isChosen
                            ? "✓ You voted for this candidate"
                            : "Already voted"
                          : votingId === candidate.id
                          ? "Confirming transaction..."
                          : "Cast Vote"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* =========================
                FOOTER
            ========================= */}

            <div
              style={{
                margin: "25px 36px 32px",
                paddingTop: "20px",
                borderTop: `1px solid ${colors.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "15px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  color: colors.secondaryText,
                  fontSize: "13px",
                }}
              >
                <span
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "9px",
                    background: colors.softBlue,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: colors.primary,
                  }}
                >
                  #
                </span>

                <span>
                  Total votes{" "}
                  <strong
                    style={{
                      color: "#1f2937",
                    }}
                  >
                    {totalVotes}
                  </strong>
                </span>
              </div>

              <button
                onClick={() => loadCandidates()}
                style={{
                  height: "40px",
                  padding: "0 15px",
                  border: `1px solid ${colors.border}`,
                  background: "#ffffff",
                  color: "#344054",
                  borderRadius: "9px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                ↻ Refresh Results
              </button>
            </div>
          </>
        )}
      </div>

      {/* Bottom branding */}
      <div
        style={{
          textAlign: "center",
          marginTop: "22px",
          color: "#8a94a6",
          fontSize: "12px",
        }}
      >
        VoteChain · Powered by Ethereum Smart Contracts
      </div>
    </div>
  );
}

export default App;