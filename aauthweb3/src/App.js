import logo from './logo.svg';
import './App.css';
import {useState} from 'react';
import React from 'react';
import { CeramicClient } from '@ceramicnetwork/http-client';
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import { EthereumAuthProvider, ThreeIdConnect} from '@3id/connect';
import { IDX } from '@ceramicstudio/idx';
import { DID } from 'dids';
//defining the endpoint node that we will be using 
const endpoint = "https://ceramic-clay.3boxlabs.com"

function App() {
  //When the app loads the user will read the profile and then thewy can update their profile as well 
 //variables when the website loads
  const [name, setName] = useState('')
  const [image, setImage] = useState('')
  const [loaded, setLoaded] = useState(false)
  //getting the Eth address 
  async function connect () {
    const addresses = await window.ethereum.request ({
      method : 'eth_requestAccounts'
    })
    return addresses;//this will return an array of addresses 
  }
  //Function for reading a profile 
  async function readProfile(){
    const [address]= await connect()// this will return an array
    //creating a ceramic instance, this is calling the endpoint that we cre4ated above  
    const ceramic = new CeramicClient(endpoint)
    //Creating an IDX instance
    const idx =new IDX ({ceramic})
    //try and catch to interact with the network
    //there would be an error if there is not a profile initiallized
    try {
      //We do not need to send a request because this is public data 
      //We justy need a user's address
      const data = await idx.get(
        'basicProfile',//this is the schema
        `${address}@eip155:1` // We pass the address and the network 
      )
      console.log('data: ', data)
   //Retrieving name and image
      if(data.name){
        setName(data.name)
      } 
      if(data.avatar){
        setImage(data.avatar)
      } 
    } catch (error) { //A potential error could happen if there is not an user logged in
      console.log('error:', error)
      alert('error:', error)
      setLoaded(true); //the site loaded and this will be after we read the user's profile
    }
  }
  async function updateProfile(){
    const [address]=await connect();
    const ceramic= new CeramicClient(endpoint);
    //Using threIdconnect, creating an instance 
    const threeIdConnect= new ThreeIdConnect();
    console.log('instance', threeIdConnect)
    const provider = new EthereumAuthProvider(window.ethereum, address);
    //Conecting the instance of 3id connect to the provider 
    await threeIdConnect.connect(provider);
    //creating the did based on the provider (WALLET ) and the resolver
    //This will create or get a reference based on the user id 
    const did = new DID({
      provider: threeIdConnect.getDidProvider(),
      resolver: {
        ...ThreeIdResolver.getResolver(ceramic)
      }
    })
    //Setting the DID
    ceramic.setDID(did)
    //Authenticating the user 
    await ceramic.did.authenticate() //We are authenticated with the user waller
    const idx= new IDX({ceramic});
    await idx.set(
      'basicProfile', {
        name,
        avatar:image
      }
    )
    alert('Profile updated :) ')
  }
  return (
    <div className="App">
  <input placeholder="Name" onChange={e => setName(e.target.value)} />
  <input placeholder="Profile Image" onChange={e => setImage(e.target.value)} />
  <button onClick={updateProfile}>Set Profile</button>
    <button onClick={readProfile}>Log in / Set profile</button>
    { name && <h3>{name}</h3> }
      { image && <img style={{ width: '400px' }} src={image} /> }
    </div>
  );
}

export default App;
