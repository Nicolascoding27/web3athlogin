import logo from './logo.svg';
import './App.css';
import {useState} from 'react';
import React from 'react';
import { CeramicClient } from '@ceramicnetwork/http-client';
import {ThreeIdResolver } from '@ceramicnetwork/3id-did-resolver'
import { EthereumAuthProvider, ThreeIdConnect} from '@3id/connect';
import { IDX } from '@ceramicstudio/idx';
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
      if(data.image){
        setImage(data.image)
      } 
    } catch (error) { //A potential error could happen if there is not an user logged in
      console.log('error:', error)
      alert('error:', error)
      setLoaded(true); //the site loaded and this will be after we read the user's profile
    }
  }
  return (
    <div className="App">
    <button onClick={readProfile}>Log in / Set profile</button>

    </div>
  );
}

export default App;
