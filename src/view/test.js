import React, { useState, useEffect } from "react";
import Web3 from "web3";

const INFURA_ENDPOINT = "https://sepolia.infura.io/v3/bed659664de2409fad659e0157b82481";
const PRIVATE_KEY = "0xeaa97f1f955dea6742bf5d08dfa5b3ec1069cf7068f5bee277a2f948c779a5c4";

const contractAddress = "0x367185a62175818d9BF91cF2f6Bb2dbF84456d5C";
const eventTransferABI = require("./eventTransfer.json");

function Test(){
    const [data, setData] = useState("Test");
    const [web3, setWeb3] = useState();
    
    const [address, setAddress] = useState("");
    const [balance, setBalance] = useState();
    
    const [block, setBlock] = useState({});
    const [transaction, setTransaction] = useState({});

    const [receiver, setReceiver] = useState("");
    const [amount, setAmount] = useState("");

    const [items, setItems] = useState([]);

    useEffect(() => {
        // const web3Instance = new Web3(
        //     new Web3.providers.HttpProvider(INFURA_ENDPOINT)
        // );
        if(window.ethereum){
            const web3Instance = new Web3(window.ethereum);
            window.ethereum.enable();
            setWeb3(web3Instance);
        }
    }, []);

    useEffect(() => {
        if(web3) {
            loadEvent();
            loadBalance();
            loadBlock();
            loadTransaction();
            listenEvent();
        }
    }, [web3]);


    const loadEvent = async () => {
        const number = await web3.eth.getBlockNumber();
        const toptic = web3.utils.keccak256("transfer(address, address, uint256)");

        const eventObject = {
            address : contractAddress,
            topics:[toptic],
            fromBlock: number - 300n,
            toBlock: "latest",
        };
        const logs = await web3.eth.getPastLogs(eventObject);
        const array = logs.map((log) => {
            const eventData = web3.abi.decodeLog(
            [
                {type:"address", name: "from", indexed: true },
                {type:"address", name: "to", indexed: true },
                {type:"uint256", name: "value" },
            ],
            log.data,
            log.topics
            );
            return eventData
        });
        setItems(array);
    };


    const listenEvent = async () => {
        const contract = new web3.eth.Contract(eventTransferABI, contractAddress);

        const eventName = "transfer";

        contract.events[eventName]({
            fromBlock: "latest"
        }).on("data", (event) => {
            setItems([event.returnValues, ...items]);
            alert("complete");
        });
    };

    const sendMetamask = async () => {
        const contract = new web3.eth.Contract(eventTransferABI, contractAddress);

        await web3.eth.sendTransaction({
            from: address,
            to: contractAddress,
            value: web3.utils.toWei(amount, "ether"),
            data: contract.methods.sendEther(receiver).encodeABI(),
        });
    };


    const loadTransaction = async () => {
        const transaction = await web3.eth.getTransaction("0x923995841bcede047cc194c6db8ebbc40285bc0e1bcdd40864ce4b31aa0911bd");
        setTransaction(transaction);
    };

    const loadBlock = async () => {
        const number = await web3.eth.getBlockNumber();
        const block = await web3.eth.getBlock(number);
        setBlock(block);
    };

    const loadBalance = async () => {
        //const account = await web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
        const accounts = await web3.eth.getAccounts();
        setAddress(accounts[0]);

        const loadBalance = await web3.eth.getBalance(accounts[0]);
        setBalance(web3.utils.fromWei(loadBalance, "ether"));
    };

    
    const sendInfura = async () => {
        const nonce = await web3.eth.getTransactionCount(address);

        const txData = {
            nonce:nonce,
            gasLimit: 21000,
            gasPrice: web3.utils.toWei("10", "gwei"),
            to: receiver,
            value: web3.utils.toWei(amount, "ether"),
        };

        const account = await web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
        const tx = await account.signTransaction(txData);
        await web3.eth.sendSignedTransaction(tx.rawTransaction);
    };

    const printObject = (data) => {
        return JSON.stringify(data, (key, value) => {
            if(typeof value === "bigint"){
                return value.toString();
            }
            return value;
        });
    };  

    return (
        <div style={{ textAlign: "center", fontsize:30 }}>
            <div>지갑 주소 : {address}</div>
            <div>보유 코인 : {balance}</div>

            <div>블럭 정보 : {printObject(block)}</div>
            <div>트랜잭션 정보: {printObject(transaction)}</div>
            <div>
                <input 
                    type="text" 
                    placeholder="Receiver Address" 
                    value={receiver}
                    onChange={(e) =>{
                        setReceiver(e.target.value);
                    }}
                />
            </div>
            <div>
                <input
                    type="text"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => {
                        setAmount(e.target.value);
                    }}
                />
            </div>
            <div>
                <button onClick={sendMetamask}>send</button>
            </div>

        <div>
            {items.map ((x) => {
                return ( 
                <div> 
                    {x.from} - {x.to} : {web3.utils.fromWei(x.value, "ether")}
                </div>
                );
            })}
        </div>
    </div>
    );
}

export default Test;