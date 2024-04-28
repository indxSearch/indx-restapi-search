'use client'

import React, { useState, useEffect } from 'react';

import Search from "./Search"
import styles from './page.module.css';


interface AccessToken {
  token?: string;
  [key: string]: any; // Extend this to fit the actual API response
}

export default function App() {

  const [apiToken, setApiToken] = useState<string>("");
  const [loginStatus, setLoginStatus] = useState<string>("Not logged in");
  const [isLoggedin, setIsLoggedin] = useState<boolean>(false);
  const [url, setUrl] = useState<string>('https://api.indx.co/api/'); // Starting url
  const [usr, setUsr] = useState<string>(''); // Indx Auth username (e-mail)
  const [pw, setPw] = useState<string>(''); // Password

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
        setApiToken(""); // Clear token on failure
      } else if (response.status === 400) {
        setApiToken("");
        setLoginStatus("Bad request");
      }
      else {
        const data: AccessToken = await response.json();
        console.log("Bearer " + data.token);
        setApiToken("Bearer " + data.token);
        setLoginStatus("Authorized as " + usr);
        setIsLoggedin(true);
      }
    } catch (error) {
      console.error("Error during login", error);
      setApiToken(""); // Clear token on error
    }
  };



  const handleUsrChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setUsr(event.target.value);
  };

  const handlePwChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setPw(event.target.value);
  };

  const handleLoginKeyPress = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      Login();
    }
  };

  const LogOut = async (): Promise<void> => {
    setUsr("");
    setPw("");
    setApiToken("");
    setLoginStatus("Not logged in");
    setIsLoggedin(false);
  }
  

  //
  // Settings panel
  //
  
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  }

  // General state handler for string and number states
  const handleStringOrNumberChange = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const value: T = event.target.type === 'number' ? Number(event.target.value) as unknown as T : event.target.value as unknown as T;
      setter(value);
    };
  };

  // General state handler for boolean states
  const handleBooleanChange = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setter(event.target.checked);
    };
  };

  const [heapId, setHeapId] = useState<string>("0"); // Default to heap 0
  const [resultsNum, setResultsNum] = useState<number>(30);
  const [doTruncate, setDoTruncate] = useState<boolean>(true);
  const [algorithm, setAlgorithm] = useState<number>(1);
  const [showMeta, setShowMeta] = useState<boolean>(false);
  const [metricScoreMin, setmetricScoreMin] = useState<number>(40);
  const [removeDuplicates, setRemoveDuplicates] = useState<boolean>(true);
  const [placeholderText, setPlaceholderText] = useState<string>("Type here to search");

  const handleHeapIdChange = handleStringOrNumberChange<string>(setHeapId);
  const handleResultsNumChange = handleStringOrNumberChange<number>(setResultsNum);
  const handleDoTruncateChange = handleBooleanChange(setDoTruncate);
  const handleShowMetaChange = handleBooleanChange(setShowMeta);
  const handleMetricScoreMinChange = handleStringOrNumberChange<number>(setmetricScoreMin);
  const handleRemoveDuplicatesChange = handleBooleanChange(setRemoveDuplicates);
  const handlePlaceholderTextChange = handleStringOrNumberChange<string>(setPlaceholderText);
  
  const handleAlgorithmChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAlgorithm(event.target.checked ? 1 : 0);
  };

  // Initial URL setup based on query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const initialUrl = queryParams.get('url');
    if (initialUrl) {
      setUrl(initialUrl); // Set URL from query parameters
    }
  }, []);
  


  return (
    <main>

      <div id={styles.auth}>
        <div id={styles.login}>

          {!isLoggedin ? (
          <>
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
            onKeyDown={handleLoginKeyPress}
          />

          <button onClick={Login}>Log in</button>
          </>
          ) : (
            <button onClick={LogOut}>Log out</button>
          )}

          <p className={styles.loginStatus}> {loginStatus} </p>

        </div>

        <div id={styles.settings}>
        <button onClick={toggleSettings}>Query parameters</button>
          {showSettings && (
            <div id={styles.settingsPanel}>

              <div>          
                  DatasetID <input
                  style={{ width: '20px' }}
                  type="text"
                  placeholder="ID"
                  value={heapId}
                  onChange={handleHeapIdChange}
                  />
              </div>

              <div>          
                  Number of results <input
                  style={{ width: '20px' }}
                  type="text"
                  placeholder="Num"
                  value={resultsNum}
                  onChange={handleResultsNumChange}
                  />
              </div>

              <div>
                Coverage 
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={algorithm === 1}
                    onChange={handleAlgorithmChange}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>

              <div>
                Truncate results 
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={doTruncate}
                    onChange={handleDoTruncateChange}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>

              { doTruncate && (
                <div>          
                    Metric Score minimum <input
                    style={{ width: '20px' }}
                    type="text"
                    placeholder="Min"
                    value={metricScoreMin}
                    onChange={handleMetricScoreMinChange}
                    />
                </div>
              )}

              <div>          
                  Placeholder <input
                  style={{ width: '140px' }}
                  type="text"
                  placeholder="Text"
                  value={placeholderText}
                  onChange={handlePlaceholderTextChange}
                  />
              </div>

              <div>
                Show meta information 
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={showMeta}
                    onChange={handleShowMetaChange}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>

              <div>
                Remove duplicates 
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={removeDuplicates}
                    onChange={handleRemoveDuplicatesChange}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>


            </div>
          )}
        </div>
      </div>

      <div id={styles.searchWrapper}>

        <Search

          //
          // INDX SEARCH COMPONENT PROPS
          //
          url = {url}
          token = {apiToken}
          results = {resultsNum} // Number of results to be returned
          heap = {heapId} // Heap or Dataset number. Default 0
          algorithm = {algorithm} // 0 or 1. 1 is default with the new Cover function that detects whole, concatenated or incomplete words.
          doTruncate = {doTruncate} // Set false if you want to always show results even when they are less likely to be relevant
          placeholderText = {placeholderText} // Placeholder for the input field
          dataSetDesc = "Undefined" // Description title of the dataset in use
          metricScoreMin = {metricScoreMin} // Minimum pattern score (of 255) to be accepted. Default 30. 
          showMeta = {showMeta} // Set true if you want to display information about key and segment numbers
          removeDuplicates = {removeDuplicates} // Set false if you want to show multiple results with the same key.
          />

      </div>

    </main>
  )
}
