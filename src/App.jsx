import React, { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";

const getEthereumObject = () => window.ethereum;

/*
 * This function returns the first linked account found.
 * If there is no account linked, it will return null.
 */
const findMetaMaskAccount = async () => {
  try {
    const ethereum = getEthereumObject();

    /*
     * First make sure we have access to the Ethereum object.
     */
    if (!ethereum) {
      console.error("Make sure you have Metamask!");
      return null;
    }

    console.log("We have the Ethereum object", ethereum);
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      return account;
    } else {
      console.error("No authorized account found");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const contractAddress = "0xb8a83eab7E8ec1Be3457795163D967E351141622";
  const contractABI= abi.abi;

  const connectWallet = async () => {
  try {
    const ethereum = getEthereumObject();
    if (!ethereum) {
      alert("Get MetaMask!");
      return;
    }

    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });

    console.log("Connected", accounts[0]);
    setCurrentAccount(accounts[0]);
  }catch (error) {
    console.error(error);
  }
};

 const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        let msg = document.getElementById("tb1").value;
        if(msg==""){
          alert("Please enter message");
        }
        else{
        const waveTxn = await wavePortalContract.wave(msg,{ gasLimit:300000 });
        console.log("Mining...", waveTxn.hash);
          document.getElementById("dC").style.opacity=0.5;
          document.getElementById("ldimg").style.visibility="visible";

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        }
        
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } 
    catch (error) {
      alert("!!Wave FAILD!!. Wait for 1 minute. STOP SPAMMING");
      console.log(error.message);
    }
    finally{
      document.getElementById("tb1").value="";
      document.getElementById("dC").style.opacity=1.0;
          document.getElementById("ldimg").style.visibility="hidden";
    }
    
}

  const [allWaves, setAllWaves] = useState([]);

  const getAllWaves = async () => {
    const { ethereum } = window;
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();

        const wavesCleaned = waves.map(wave => {
        return {
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message,
          };
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
  let wavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  if(window.ethereum){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
      
    }
  };
}, []);
  
  useEffect(async () => {
    const account = await findMetaMaskAccount();
    if (account !== null) {
      setCurrentAccount(account);
    }
  }, []);

  return (
    <>
    <body>
    return (
    <div className="mainContainer">
      <div>
        <img className="ldimg" id="ldimg" src="../load.gif" alt="loading.." />
      </div>
      <div className="dataContainer" id="dC">
        <div className="header bio">
          👋 Hey there!
        </div>

        <div className="bio">
          I am Ramanuj.I have made this website with <span className="ul1">buildspace.so</span> .I am working with Blockchain Test network.I have used hardhat, Solidity, replit, QuickNode.
        </div>
        <div className="bio">
          This is simple website connected with Metamask wallet. Here you can send a message with a wave to me.
        </div>

        <div>
          <form>
            <textarea className="textbox1" id="tb1" rows="5" cols="20" width="480px" height="50px" placeholder="Enter Message..." required/>
          </form>
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "orange", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
    </body>
    </>
  );
};

export default App;