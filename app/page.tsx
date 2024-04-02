'use client'

import React, { useState, ChangeEvent } from 'react';

import Search from "./Search"
import styles from './page.module.css';


interface AccessToken {
  token?: string;
  [key: string]: any; // Extend this to fit the actual API response
}

export default function App() {

  const [apiToken, setapiToken] = useState<string>("");
  const [loginStatus, setLoginStatus] = useState<string>("Not logged in");
  const [url, setUrl] = useState<string>('https://api.indx.co/api/'); // Starting url
  const [usr, setUsr] = useState<string>(''); // Indx Auth username (e-mail)
  const [pw, setPw] = useState<string>(''); // Password
  const [heapId, setHeapId] = useState<string>("0"); // Default to heap 0

  // Login to fetch API token
  const Login = async (): Promise<void> => {
    try {
      const response = await fetch(url + "Login?userEmail=" + usr + "&userPassWord=" + pw, {
        method: 'POST',
        headers: {
          'Accept': 'text/plain',
          'Authorization': apiToken,
        },
      });

      if (response.status === 401) {
        // Unauthorized
        console.error("Login failed: Unauthorized");
        setLoginStatus("Unauthorized. Check credentials");
        setapiToken(""); // Clear token on failure
      } else if (response.status === 400) {
        setapiToken("");
        setLoginStatus("Bad request");
      }
      else {
        const data: AccessToken = await response.json();
        console.log("Bearer " + data.token);
        setapiToken("Bearer " + data.token);
        setLoginStatus("Authorized");
      }
    } catch (error) {
      console.error("Error during login", error);
      setapiToken(""); // Clear token on error
    }
  };



  const handleUsrChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setUsr(event.target.value);
  };

  const handlePwChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setPw(event.target.value);
  };

  const handleHeapChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setHeapId(event.target.value);
  };



  return (
    <main>

      <div id={styles.auth}>
        <div id={styles.login}>
          <input
            type="text"
            placeholder="Username"
            value={usr}
            onChange={handleUsrChange}
          />
          <input
            type="Password"
            placeholder="Password"
            value={pw}
            onChange={handlePwChange}
          />

          <button onClick={Login}>Login</button>

          <p className={styles.loginStatus}> {loginStatus} </p>

        </div>

        <div id={styles.settings}>
          DatasetID <input
            style={{ width: '30px' }}
            type="text"
            placeholder="HeapID"
            value={heapId}
            onChange={handleHeapChange}
          />
        </div>
      </div>

      <div id={styles.searchWrapper}>

        <Search

          //
          // INDX SEARCH COMPONENT PROPS
          //

          token = {apiToken}
          results = {30} // Number of results to be returned
          heap = {heapId} // Heap or Dataset number. Default 0
          algorithm = {1} // 0 or 1. 1 is default with the new Cover function that detects whole, concatenated or incomplete words.
          doTruncate = {true} // Set false if you want to always show results even when they are less likely to be relevant
          // firstQuery = "" // Use this to do a search when first loading
          placeholderText="Type here to search" // Placeholder for the input field
          dataSetDesc = "My search demo" // Description title of the dataset in use
          // metricScoreMin={30} // Minimum pattern score (of 255) to be accepted. Default 30. 
          // showMeta = {false} // Set true if you want to display information about key and segment numbers
          // removeDuplicates = {true} // Set false if you want to show multiple results with the same key.

          />

      </div>

    </main>
  )
}
