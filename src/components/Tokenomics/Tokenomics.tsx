import React, { useState } from 'react';
import axios from 'axios';
import { PieChart } from 'react-minimal-pie-chart';

import Web3 from 'web3'
import { useEffect } from 'react';
import './Tokenomics.css'
import BurnedTokens from '../BurnedTokens/BurnedTokens';
import { ContractAddesses } from '../../utils/addresses';
import { AVAX_SPORE_ABI, BSC_SPORE_ABI } from '../../utils/SporeAbis';
import { AVAX_NETWORK_RPC } from '../../utils/constants';

//to test api on local environment just load the .env file with the REACT_APP_API_URL variable set on localhost:5001
const API_URL = process.env.REACT_APP_API_URL || "https://frontend-api.sporeproject.org";


const Tokenomics = () => {
  const win = window as any
  const web3 = new Web3('https://bsc-dataseed1.binance.org:443');
  const ava = new Web3(AVAX_NETWORK_RPC);
  const [bscBurned, setBscBurned] = useState(-1)
  const [avaBurned, setAvaBurned] = useState(-1)
  const [avaxBridge, setAvaxBridge] = useState(-1)
  const [bscTotalSupply, setBscTotalSupply] = useState(-1)
  const [totalTokenHolders, setTotalTokenHolders] = useState(0)

  useEffect(() => {
    async function getInfos() {
      await getAvaBurned()
      await getAvaxBridge()
      await getBscTotalSupply()
      await getBscBurned()
      await getTokenHolders()


      setInterval(async () => {
        await getAvaBurned()
        await getAvaxBridge()
        await getBscTotalSupply()
        await getBscBurned()

        await getTokenHolders()

      }, 6000000)
    }

    getInfos()
    // eslint-disable-next-line
  }, [])

  const getBscBurned = async () => {
    try {
      console.log("getting bsc burned tokens");
      const SporeContract = new web3.eth.Contract(
        BSC_SPORE_ABI,
        ContractAddesses.BSC_SPORE_MAINNET
      );

      const bscburn = await SporeContract.methods.balanceOf(ContractAddesses.BSC_SPORE_MAINNET).call();
      setBscBurned(bscburn / (10 ** 9));
    }
    catch (err) {
      console.log("Error getting burned tokens bsc")
    }
  }

  const getAvaBurned = async () => {
    try {
      console.log("getting avax burned tokens");
      const SporeContract = new ava.eth.Contract(
        AVAX_SPORE_ABI,
        ContractAddesses.AVAX_SPORE_MAINNET
      );

      const avaburn = await SporeContract.methods.balanceOf(ContractAddesses.DEAD_ADDRESS).call();
      setAvaBurned(avaburn / (10 ** 9));

    }
    catch (err) {
      console.log("Error getting burned tokens avax")
    }
  }

  const getAvaxBridge = async () => {
    try {
      console.log("getting avax bridge tokens");
      const SporeContract = new win.ava.eth.Contract(
        AVAX_SPORE_ABI,
        ContractAddesses.AVAX_SPORE_MAINNET
      );

      const avaxbridge = await SporeContract.methods.balanceOf(ContractAddesses.AVAX_BRIDGE_MAINNET).call();
      setAvaxBridge(avaxbridge / (10 ** 9));

    }
    catch (err) {
      console.log("Error getting tokens bridge")
    }
  }

  const getBscTotalSupply = async () => {
    try {
      console.log("getting bsc total supply");
      const SporeContract = new web3.eth.Contract(
        BSC_SPORE_ABI,
        ContractAddesses.BSC_SPORE_MAINNET
      );

      const bsctotalsupply = await SporeContract.methods.totalSupply().call();
      setBscTotalSupply(bsctotalsupply / (10 ** 9));

    }
    catch (err) {
      console.log("Error getting bsc totalSupply")
    }
  }

  const getTokenHolders = async () => {
    console.log("getting token holders avax")
    try {
      const endpoint = '/avax-holders'; // Endpoint path
      const url = `${API_URL}${endpoint}`; // Construct the full URL
      const res = await axios.get(url); // Send the request to the API

      setTotalTokenHolders(res.data)

    }
    catch (err) {
      console.log("errror getting holders avax", err)
    }
  }


  const TOTAL_SUPPLY = 100000000000000000
  console.log("TotalTokenHolders",totalTokenHolders)

  return (
    <section className='tokenomic'>
      <div className='container information py-5'>
        <div className="container mx-0">
          <div className="inner-header w-100 h-100 d-flex flex-column justify-content-center align-items-center">
            <h1 className='feature pb-1'><span>Tokenomics</span></h1>
            <div className="text-kecil"></div>
          </div>
        </div>

        <div className='row py-4'>
          <div className='col-md-12 col-lg-4 col-sm-12 text-left'>
            <ul className='list-unstyled'>
              <BurnedTokens
                supplyAVA={TOTAL_SUPPLY - avaBurned - avaxBridge}
                supplyBSC={bscTotalSupply - bscBurned}
                burnedTotal={avaBurned + avaxBridge - bscTotalSupply + bscBurned}
                totalTokenHolders={totalTokenHolders}
              />
            </ul>
          </div>
          <div className='col-md-12 col-lg-8 col-sm-12 my-5 text-center' id="section-chart">
            <PieChart
              className='chart'
              style={{
                fontFamily:
                  '"Nunito Sans", -apple-system, Helvetica, Arial, sans-serif',
                fontSize: '8px',
                position: 'relative',
                overflow: 'visible'
              }}
              data={[
                { key: 'burnedToken', title: 'Burned Tokens', value: (avaBurned + avaxBridge - bscTotalSupply + bscBurned) / TOTAL_SUPPLY * 100, color: 'black' },
                { key: 'bscSupply', title: 'BSC supply', value: (bscTotalSupply - bscBurned) / TOTAL_SUPPLY * 100, color: '#f3ba2f' },
                { key: 'avaSupply', title: 'Avalanche Supply', value: (TOTAL_SUPPLY - avaBurned - avaxBridge) / TOTAL_SUPPLY * 100, color: '#e84142' },
              ]}
              // radius={PieChart.defaultProps.radius - 6}
              radius={44}
              lineWidth={50}
              segmentsStyle={{ transition: 'stroke .3s', cursor: 'pointer' }}
              // segmentsShift={(index) => (index === selected ? 6 : 0)}
              animate
              label={({ dataEntry }) => Math.round(dataEntry.percentage) + '%'}
              labelPosition={100 - 50 / 2}
              labelStyle={{
                fill: '#fff',
                opacity: 0.75,
                pointerEvents: 'none',
                fontWeight: 'bold'
              }}
            />
            <ul className="chart-caption__list">
              <li className="chart-caption__item">
                <span className="chart-caption__dot chart-caption__dot--bsc"></span>
                <i className="chart-caption__text">BSC Supply</i>
              </li>
              <li className="chart-caption__item">
                <span className="chart-caption__dot chart-caption__dot--alavanche"></span>
                <i className="chart-caption__text">Avalanche Supply</i>
              </li>
              <li className="chart-caption__item">
                <span className="chart-caption__dot"></span>
                <i className="chart-caption__text">Burned Tokens</i>
              </li>
            </ul>
            <ul className="lead">
              <li className="chart-caption__item">
                <i className="chart-caption__text">*BSC and Avalanche supplies are both connected by our <a className="bridgeLink" href='/bridge' >Bridge</a></i>
              </li>
            </ul>
          </div>
         
        </div>


      </div>
    </section>
  );
}

export default Tokenomics
