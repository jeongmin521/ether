import React, { useState, useEffect } from "react";
import Web3 from "web3";

const tokenAddress="0x7BC4232B222E8516E2955bd43B8E1155156cBC78";
const tokenABI = require("./token.json");

const defiAddress = "0x7436ad3EC67Dd07D30800207574B325Cbf34A14F";
const defiABI = require("./defi.json");

function Test2(){
    const [web3, setWeb3] = useState();
    const [address, setAddress] = useState("");
    const [balance, setBalance] = useState();
    const [contractBalance, setContractBalance] = useState();
    const[amount, setAmount]  = useState();

    useEffect(() => {
        if(window.ethereum){
            const web3Instance = new Web3(window.ethereum);
            window.ethereum.enable();
            setWeb3(web3Instance);
        }
    }, []);


    useEffect(() => {
        if(web3){
            loadBalance();
        }
    }, [web3]);

    const loadBalance = async () => {
        const accounts = await web3.eth.getAccounts();
        setAddress(accounts[0]);

        const contract = new web3.eth.Contract(tokenABI, tokenAddress);
        const balance = await contract.methods.balanceOf(accounts[0]).call();
        setBalance(web3.utils.fromWei(balance, "ether"));
        const defiContract = new web3.eth.Contract(defiABI, defiAddress);
        const contractBalance = await defiContract.methods.hasAmount().call();
        setContractBalance(web3.utils.fromWei(contractBalance, "ether"));
    
    };


    const clickApprove = async() => {
        const contract = new web3.eth.Contract(tokenABI, tokenAddress);

        await web3.eth.sendTransaction({
            from:address,
            to: tokenAddress,
            vlaue: 0,
            data: contract.methods
            .approve(defiAddress, web3.utils.toWei(amount, "ether"))
            .encodeABI(),
        });
    };

    const clickDeposit = async () => {
        const contract = new web3.eth.Contract(defiABI, defiAddress)

        await web3.eth.sendTransaction({
            from: address,
            to: defiAddress,
            value: 0,
            data: contract.methods
            .depositTokens(web3.utils.toWei(amount, "ether"))
            .encodeAzBI(),
        });
    };

    const clickWithdraw = async() => {
        const contract = new web3.eth.Contract(defiABI, defiAddress);

        await web3.eth.sendTransaction({
            from: address,
            to: defiAddress,
            value: 0,
            data: contract.methods.withdrawTokens().encodeABI(),
        });
    };


    return (
        <div style={{ fontSize: 40, textAlign:"center" }}>
            <div>지갑 주소 : {address} </div>
            <div>보유 토큰 : {balance} </div>
            <div>Defi 컨트랙트 보유토큰 : {contractBalance} </div>

            <div>
                <input
                type="text"
                placeholder="Amount"
                value={amount}
                onChange={(e) => {
                    setAmount(e.target.value);
                }}
                ></input>
            </div>
            <div>
                <button onClick={clickDeposit}>Deposit</button>
            </div>
            <div>
                <button onClick={clickWithdraw}>Withdraw</button>
            </div>
            <div>
                <button onClick={clickApprove}>Approve</button>
            </div>
        </div>
    );
}

export default Test2;