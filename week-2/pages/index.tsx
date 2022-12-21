import abi from "../utils/BuyMeACoffee.json";
import { ethers } from "ethers";
import Head from "next/head";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import { Memo } from "../types/memo";

// Contract Address & ABI
const contractAddress = "0x813C080BAC2DA8d35560576FE50D094868860eA4";
const contractABI = abi.abi;

export default function Home() {
    // Component state
    const [currentAccount, setCurrentAccount] = useState("");
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [memos, setMemos] = useState<Memo[]>([]);
    const [error, setError] = useState("");

    const onNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const onMessageChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(event.target.value);
    };

    // Wallet connection logic
    const isWalletConnected = async () => {
        try {
            const { ethereum } = window;

            if (ethereum.request) {
                const accounts = await ethereum.request({ method: "eth_accounts" });
                console.log("accounts: ", accounts);

                if (accounts.length > 0) {
                    const account = accounts[0];
                    console.log("wallet is connected! " + account);
                } else {
                    console.log("make sure MetaMask is connected");

                    setError("Make sure MetaMask is connected");
                }
            }
        } catch (error) {
            console.log("error: ", error);

            setError(error instanceof Error ? error.message : "Something went wrong");
        }
    };

    const connectWallet = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                console.log("please install MetaMask");

                setError("Please install MetaMask");
            }

            if (ethereum.request) {
                const accounts = await ethereum.request({
                    method: "eth_requestAccounts",
                });

                setCurrentAccount(accounts[0]);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const buyCoffee = async (large = false) => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum, "any");
                const signer = provider.getSigner();
                const buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer);

                console.log("buying coffee..");
                const coffeeTxn = await buyMeACoffee.buyCoffee(
                    name ? name : "anon",
                    message ? message : "Enjoy your coffee!",
                    { value: ethers.utils.parseEther(large ? "0.003" : "0.001") },
                );

                await coffeeTxn.wait();

                console.log("mined ", coffeeTxn.hash);

                console.log("coffee purchased!");

                // Clear the form fields.
                setName("");
                setMessage("");
            }
        } catch (error) {
            console.log(error);

            setError(error instanceof Error ? error.message : "Something went wrong");
        }
    };

    // Function to fetch all memos stored on-chain.
    const getMemos = useCallback(async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer);

                console.log("fetching memos from the blockchain..");
                const memos = await buyMeACoffee.getMemos();
                console.log("fetched!");
                setMemos(memos);
            } else {
                console.log("Metamask is not connected");

                setError("Metamask is not connected");
            }
        } catch (error) {
            console.log(error);

            setError(error instanceof Error ? error.message : "Something went wrong");
        }
    }, []);

    useEffect(() => {
        let buyMeACoffee: any;
        isWalletConnected();
        getMemos();

        // Create an event handler function for when someone sends
        // us a new memo.
        const onNewMemo = (from: string, timestamp: number, name: string, message: string) => {
            console.log("Memo received: ", from, timestamp, name, message);
            setMemos((prevState) => [
                ...prevState,
                {
                    address: from,
                    timestamp: new Date(timestamp * 1000),
                    message,
                    name,
                },
            ]);
        };

        const { ethereum } = window;

        // Listen for new memo events.
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum, "any");
            const signer = provider.getSigner();
            buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer);

            buyMeACoffee.on("NewMemo", onNewMemo);
        }

        return () => {
            if (buyMeACoffee) {
                buyMeACoffee.off("NewMemo", onNewMemo);
            }
        };
    }, [getMemos]);

    return (
        <div className={styles.container}>
            <Head>
                <title>Buy Ned a Coffee!</title>
                <meta name="description" content="Tipping site" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Buy Ned a Coffee!</h1>

                {error && <p>{error}</p>}

                {currentAccount ? (
                    <div>
                        <span title={currentAccount}>
                            Connected with {`${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`}
                        </span>
                        <form>
                            <div>
                                <label>Name</label>
                                <br />

                                <input id="name" type="text" placeholder="anon" onChange={onNameChange} />
                            </div>
                            <br />
                            <div>
                                <label>Send Ned a message</label>
                                <br />

                                <textarea
                                    rows={3}
                                    placeholder="Enjoy your coffee!"
                                    id="message"
                                    onChange={onMessageChange}
                                    required
                                ></textarea>
                            </div>
                            <div>
                                <button type="button" onClick={() => buyCoffee()}>
                                    Send 1 Coffee for 0.001ETH
                                </button>
                            </div>
                            <div>
                                <button type="button" onClick={() => buyCoffee(true)}>
                                    Send 1 Large Coffee for 0.003ETH
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <button onClick={connectWallet}> Connect your wallet </button>
                )}
            </main>

            {currentAccount && <h1>Memos received</h1>}

            {currentAccount &&
                memos.map((memo, idx) => {
                    return (
                        <div
                            key={idx}
                            style={{ border: "2px solid", borderRadius: "5px", padding: "5px", margin: "5px" }}
                        >
                            <p style={{ fontWeight: "bold" }}>&quot;{memo.message}&quot;</p>
                            <p>
                                From: {memo.name} at {memo.timestamp.toString()}
                            </p>
                        </div>
                    );
                })}

            <footer className={styles.footer}>
                <a href="https://alchemy.com/?a=roadtoweb3weektwo" target="_blank" rel="noopener noreferrer">
                    Created by @thatguyintech for Alchemy&apos;s Road to Web3 lesson two!
                </a>
            </footer>
        </div>
    );
}
