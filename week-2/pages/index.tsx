import abi from "../utils/BuyMeACoffee.json";
import { ethers } from "ethers";
import Head from "next/head";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Memo, MemoRaw } from "../types/memo";

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

    const buyCoffee = async (tip: string) => {
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
                    { value: ethers.utils.parseEther(tip) },
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
                const memos = (await buyMeACoffee.getMemos()) as MemoRaw[];
                console.log("fetched!");
                setMemos(
                    memos.map(({ from, timestamp, message, name, amount }) => ({
                        address: from,
                        timestamp: new Date(timestamp * 1000),
                        message,
                        name,
                        amount,
                    })),
                );
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
        let buyMeACoffee: ethers.Contract;
        isWalletConnected();
        getMemos();

        // Create an event handler function for when someone sends
        // us a new memo.
        const onNewMemo = (from: string, timestamp: number, name: string, message: string, amount: string) => {
            console.log("Memo received: ", from, timestamp, name, message, amount);
            setMemos((prevState) => [
                ...prevState,
                {
                    address: from,
                    timestamp: new Date(timestamp * 1000),
                    message,
                    name,
                    amount,
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
        <div className="min-h-screen px-4 flex flex-col justify-center items-center">
            <Head>
                <title>Buy Ned a Coffee!</title>
                <meta name="description" content="Tipping site" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="flex-1 py-20 flex flex-col justify-center items-center">
                <h1 className="text-4xl sm:text-6xl">
                    Buy{" "}
                    <a
                        href="https://github.com/edwardhorsey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                    >
                        Ned
                    </a>{" "}
                    a Coffee!
                </h1>

                {currentAccount && (
                    <span title={currentAccount} className="mt-5 py-5 text-lg">
                        Connected with {`${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`}
                    </span>
                )}

                {currentAccount ? (
                    <div className="my-5 p-5 border-2 border-gray-200 rounded-xl w-full max-w-sm">
                        <form className="flex flex-col">
                            <label className="flex flex-col mb-5">
                                <span className="font-bold">Name</span>
                                <input id="name" type="text" placeholder="anon" onChange={onNameChange} />
                            </label>
                            <label className="flex flex-col mb-5">
                                <span className="font-bold">Send Ned a message</span>
                                <textarea
                                    rows={3}
                                    placeholder="Enjoy your coffee!"
                                    id="message"
                                    onChange={onMessageChange}
                                    required
                                ></textarea>
                            </label>
                            <button
                                type="button"
                                onClick={() => buyCoffee("0.001")}
                                className="bg-blue-500 text-white px-8 py-3 rounded-xl my-2"
                            >
                                Send 1 Coffee for 0.001ETH
                            </button>
                            <button
                                type="button"
                                onClick={() => buyCoffee("0.005")}
                                className="bg-blue-500 text-white px-8 py-3 rounded-xl my-2"
                            >
                                Send 1 Large Coffee for 0.003ETH
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="mt-5">
                        <button onClick={connectWallet} className="bg-blue-500 text-white px-8 py-3 rounded-xl my-2">
                            {" "}
                            Connect your wallet{" "}
                        </button>
                    </div>
                )}

                {currentAccount && (
                    <>
                        <span className="mt-5 py-5 text-lg">Memos received</span>
                        {memos.map((memo, idx) => {
                            return (
                                <div
                                    key={idx}
                                    className="border-2 border-gray-200 rounded-xl m-1 py-2 px-3 w-full max-w-sm flex flex-col items-start"
                                >
                                    <p className="font-bold">&quot;{memo.message}&quot;</p>
                                    <p>
                                        From: {memo.name} at {memo.timestamp.toDateString()}
                                    </p>
                                </div>
                            );
                        })}
                    </>
                )}
            </main>

            <footer className="flex justify-center items-center h-12 border-t-slate-100">
                <span>
                    Created by{" "}
                    <a
                        href="https://twitter.com/EdwardHorsey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                    >
                        @EdwardHorsey
                    </a>{" "}
                    for Alchemy&apos;s{" "}
                    <a
                        href="https://alchemy.com/?a=roadtoweb3weektwo"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                    >
                        Road to Web3
                    </a>{" "}
                    lesson two!
                </span>
            </footer>
        </div>
    );
}
