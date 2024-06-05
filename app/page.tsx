'use client'

import React, { useState, useEffect } from 'react';

import Search from "./Search"
import styles from './page.module.css';


interface AccessToken {
  token?: string;
  [key: string]: any; // Extend this to fit the actual API response
}

interface DatasetInfo {
  [dataset: string]: any;
}

export default function App() {

  const [apiToken, setApiToken] = useState<string>("");
  const [loginStatus, setLoginStatus] = useState<string>("Not logged in");
  const [isLoggedin, setIsLoggedin] = useState<boolean>(false);
  const [url, setUrl] = useState<string>('https://v33.indx.co/api/'); // Starting url
  const [usr, setUsr] = useState<string>(''); // Indx Auth username (e-mail)
  const [pw, setPw] = useState<string>(''); // Password
  const [datasetInfo, setDatasetInfo] = useState<DatasetInfo>([]);

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
        GetDatasets('Bearer ' + data.token);
      }
    } catch (error) {
      console.error("Error during login", error);
      setApiToken(""); // Clear token on error
    }
  };

  // Retrieve existing datasets
  const GetDatasets = async (token: string): Promise<void> => {
    try {
      const response = await fetch(`${url}Search/datasets`, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
          'Authorization': token,
        },
      });

      if (response.status === 401) {
        // Unauthorized
        console.error('Unauthorized access to datasets');
        setDatasetInfo([]);
      } else {
        const data = await response.json();
        if (data && data.length > 0) {
          setDatasetInfo(data);
          setDataset(data[0]);
        } else {
          setDatasetInfo([]);
        }
      }
    } catch (error) {
      console.error('Error getting dataset info', error);
      setDatasetInfo([]);
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
    setDatasetInfo([]);
  }
  

  //
  // Settings panel
  //
  
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  }

  const [showCoverageSetup, setShowCoverageSetup] = useState<boolean>(false);
  const toggleCoverageSetup = () => {
    setShowCoverageSetup(!showCoverageSetup);
  }

  // General state handler for string and number states
  const handleStringOrNumberChange = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const value: T = event.target.type === 'number' ? Number(event.target.value) as unknown as T : event.target.value as unknown as T;
      setter(value);
    };
  };

  const [dataset, setDataset] = useState<string>("undefined");
  const [resultsNum, setResultsNum] = useState<number>(30);
  const [doTruncate, setDoTruncate] = useState<boolean>(true);
  const [coverage, setcoverage] = useState<boolean>(true);
  const [showMeta, setShowMeta] = useState<boolean>(false);
  const [metricScoreMin, setmetricScoreMin] = useState<number>(40);
  const [removeDuplicates, setRemoveDuplicates] = useState<boolean>(true);
  const [placeholderText, setPlaceholderText] = useState<string>("Type here to search");
  const [minWordSize, setMinWordSize] = useState<number>(2);
  const [coverWholeQuery, setcoverWholeQuery] = useState<boolean>(true);
  const [coverWholeWords, setcoverWholeWords] = useState<boolean>(true);
  const [coverFuzzyWords, setcoverFuzzyWords] = useState<boolean>(true);
  const [coverJoinedWords, setcoverJoinedWords] = useState<boolean>(true);
  const [coverPrefixSuffix, setcoverPrefixSuffix] = useState<boolean>(true);

  const handleResultsNumChange = handleStringOrNumberChange<number>(setResultsNum);
  const handleMetricScoreMinChange = handleStringOrNumberChange<number>(setmetricScoreMin);
  const handlePlaceholderTextChange = handleStringOrNumberChange<string>(setPlaceholderText);
  const handleMinWordSizeChange = handleStringOrNumberChange<number>(setMinWordSize);

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
              Dataset
                <select
                  style={{ width: '150px' }}
                  value={dataset}
                  onChange={(event) => setDataset(event.target.value)}
                >
                  <option value="" disabled>Select a dataset</option>
                  {datasetInfo.map((ds: any, index: number) => (
                    <option key={index} value={ds}>
                      {ds !== null && ds !== undefined ? ds.toString() : 'N/A'}
                    </option>
                  ))}
                </select>
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
                    checked={coverage}
                    onChange={(event) => setcoverage(event.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>

              
              

              { coverage && (
                <div id={styles.coverageSetup}>
                  <div>
                    <button onClick={toggleCoverageSetup}>{!showCoverageSetup ? "Show Coverage Setup ►" : "Hide Coverage Setup ▼"}</button>
                  </div>
                  { showCoverageSetup && (
                  <div>

                    <div>   
                      Minimum word size <input
                      style={{ width: '20px' }}
                      type="text"
                      placeholder="Min"
                      value={minWordSize}
                      onChange={handleMinWordSizeChange}
                      />
                    </div>

                    <div>
                      Whole query 
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={coverWholeQuery}
                          onChange={(event) => setcoverWholeQuery(event.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>

                    <div>
                      Whole words
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={coverWholeWords}
                          onChange={(event) => setcoverWholeWords(event.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>

                    <div>
                      Fuzzy words
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={coverFuzzyWords}
                          onChange={(event) => setcoverFuzzyWords(event.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>

                    <div>
                      Joined words
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={coverJoinedWords}
                          onChange={(event) => setcoverJoinedWords(event.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>

                    <div>
                      Prefix and suffix
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={coverPrefixSuffix}
                          onChange={(event) => setcoverPrefixSuffix(event.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>

                  </div>
                  )}
                </div>
              )}

              <div>
                Truncate results 
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={doTruncate}
                    onChange={(event) => setDoTruncate(event.target.checked)}
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
                    onChange={(event) => setShowMeta(event.target.checked)}
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
                    onChange={(event) => setRemoveDuplicates(event.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>


            </div>
          )}
        </div>
      </div>

      <div id={styles.searchWrapper} className={`${!isLoggedin ? styles.unauthorized : ''}`}>

        <Search

          //
          // INDX SEARCH COMPONENT PROPS
          //
          url = {url}
          token = {apiToken}
          results = {resultsNum} // Number of results to be returned
          dataset = {dataset} // Dataset name
          applyCoverage = {coverage} // Coverage function that detects whole, concatenated or incomplete words.
          doTruncate = {doTruncate} // Set false if you want to always show results even when they are less likely to be relevant
          placeholderText = {placeholderText} // Placeholder for the input field
          dataSetDesc = {dataset} // Description title of the dataset in use
          metricScoreMin = {metricScoreMin} // Minimum pattern score (of 255) to be accepted. Default 30. 
          showMeta = {showMeta} // Set true if you want to display information about key and segment numbers
          removeDuplicates = {removeDuplicates} // Set false if you want to show multiple results with the same key.
          // CoverageSetup
          MinWordSize = {minWordSize} // Minimum word to be covered
          coverWholeQuery = {coverWholeQuery} // Look for whole string query
          coverWholeWords = {coverWholeWords} // Cover whole isolated words
          coverFuzzyWords = {coverFuzzyWords} // Cover isolated words with a typo
          coverJoinedWords = {coverJoinedWords} // Cover words that are split (works both ways)
          coverPrefixSuffix = {coverPrefixSuffix} // Cover prefix and suffix words
          />

      </div>

    </main>
  )
}
