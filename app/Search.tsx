'use client'

/*
SEARCH for RestAPI
For V3.2 with CoverageSetup

See docs.indx.co to learn more.
Go to auth.indx.co to register for a developer account
*/

import React, { useState, useEffect } from 'react';
import styles from './Search.module.css';


interface SearchProps {
  url?: string; // Url to API. Default https://api.indx.co/api/Search
  token?: string; // Formatted as Bearer + token. Retrieved when logging in.
  results?: number; // Number of results to be returned
  heap?: string; // Heap or Dataset number. Default 0
  algorithm?: number; // 0 or 1. 1 is default with the new Cover function that detects whole, concatenated or incomplete words.
  placeholderText?: string; // Placeholder for the input field
  dataSetDesc?: string; // Description title of the dataset in use
  metricScoreMin?: number;
  doTruncate?: boolean; // Set false if you want to always show results
  showMeta?: boolean; // Set true if you want to display information about key and segment numbers
  removeDuplicates?: boolean; // Set false if you want to show multiple results with the same key.

  // Coverage settings. Advanced settings.
  lcsTopErrorTolerance?: number;
  lcsTopMaxRepetions?: number;
  lcsErrorTolerance?: number;
  lcsMaxRepetitions?: number;
  lcsBottomErrorTolerance?: number;
  lcsBottomMaxRepetitions?: number;
  lcsWordMinWordSize?: number;
  lcsWordLcsErrorTolerance?: number;
  lcsWordLcsMaxRepetitions?: number;
  coverageMinWordHitsAbs?: number;
  coverageMinWordHitsRelative?: number;
  coverageQLimitForErrorTolerance?: number;
  coverageLcsErrorToleranceRelativeq?: number;
}

// Interfaces
interface ApiResponse {
  searchRecords: Record[];
  coverageBottomIndex?: number;
}

interface Record {
  metricScore: number;
  documentTextToBeIndexed: string;
  documentKey: string;
  segmentNumber: number;
}


const Search: React.FC<SearchProps> = ({
  url = "https://api.indx.co/api/Search",
  token = "",
  heap = "0",
  results = 20,
  algorithm = 1,
  placeholderText = "Search",
  dataSetDesc = "Undefined",
  metricScoreMin = 30,
  doTruncate = true,
  showMeta = false,
  removeDuplicates = true,

  // COVERAGE SETUP (Default values)
  // Only activates on algorithm 1
  lcsTopErrorTolerance = 0,
  lcsTopMaxRepetions = 0,
  lcsErrorTolerance = 0,
  lcsMaxRepetitions = 0,
  lcsBottomErrorTolerance = 0,
  lcsBottomMaxRepetitions = 0,
  lcsWordMinWordSize = 2,
  lcsWordLcsErrorTolerance = 0,
  lcsWordLcsMaxRepetitions = 0,
  coverageMinWordHitsAbs = 1,
  coverageMinWordHitsRelative = 0,
  coverageQLimitForErrorTolerance = 5,
  coverageLcsErrorToleranceRelativeq = 0.2
}) => {
  const [records, setRecords] = useState<Record[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [truncateIndex, setTruncateIndex] = useState<number>(-1);

  const callAPI = async (queryText: string) => {
    try {
      const response = await fetch(`${url}Search/${heap}`, {
        cache: "no-cache",
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          algorithm: algorithm,
          keyExcludeFilter: null,
          keyIncludeFilter: null,
          logPrefix: "",
          maxNumberOfRecordsToReturn: results,
          removeDuplicates: removeDuplicates,
          soughtText: queryText,
          timeOutLimitMilliseconds: 1000, //timeout after 1s
          coverageSetup: {
            lcsTopErrorTolerance: lcsTopErrorTolerance,
            lcsTopMaxRepetions: lcsTopMaxRepetions,
            lcsErrorTolerance: lcsErrorTolerance,
            lcsMaxRepetitions: lcsMaxRepetitions,
            lcsBottomErrorTolerance: lcsBottomErrorTolerance,
            lcsBottomMaxRepetitions: lcsBottomMaxRepetitions,
            lcsWordMinWordSize: lcsWordMinWordSize,
            lcsWordLcsErrorTolerance: lcsWordLcsErrorTolerance,
            lcsWordLcsMaxRepetitions: lcsWordLcsMaxRepetitions,
            coverageMinWordHitsAbs: coverageMinWordHitsAbs,
            coverageMinWordHitsRelative: coverageMinWordHitsRelative,
            coverageQLimitForErrorTolerance: coverageQLimitForErrorTolerance,
            coverageLcsErrorToleranceRelativeq: coverageLcsErrorToleranceRelativeq,
          },
          numberOfRecordsForAppliedAlgorithm: 1000,
        }),
      });

      const data: ApiResponse = await response.json();

      if (data && data.searchRecords) {
        // Filter records where metricScore is above min threshold
        const filteredRecords = data.searchRecords.filter((record) => record.metricScore >= metricScoreMin);
        setRecords(queryText.length > 1 ? filteredRecords : data.searchRecords);
        setTruncateIndex(doTruncate ? data.coverageBottomIndex ?? -1 : -1);
      } else {
        setRecords([]); // Reset to empty array if response is not as expected
      }
    } catch (err) {
      console.error(err);
      setRecords([]); // Reset to empty array in case of error
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setSearchText(newValue);
    callAPI(newValue);
  };

  return (
    <div className={styles.content}>
      <div id={styles.searchheader}>

        <input
          placeholder={placeholderText}
          value={searchText}
          onChange={handleInputChange}
          className={styles.input}
        />

        <div id={styles.meta}>
          <div className={styles.metafields}>
            <div className={styles.description}>INDX SEARCH SYSTEM</div>
            {showMeta ? (
              <>
                <div className={styles.metainfo}>Dataset: {dataSetDesc} / Heap: {heap}</div>
                <div className={styles.metainfo}>Algorithm: {algorithm}</div>
                <div className={styles.metainfo}>Url: {url}</div>
              </>
            ) : (
              <div className={styles.metainfo}>Dataset: {dataSetDesc}</div>
            )}
          </div>
        </div>
      </div>

      <ul className={`${styles.ul} ${records.length === 0 ? styles.passive : ''}`}>
        
        {records.map((entry, index) => {
          const lastInList = index === truncateIndex && doTruncate;
          const truncated = truncateIndex !== -1 && index > truncateIndex && doTruncate;
          return (
            <li key={index} className={`${lastInList ? styles.lastInList : ''} ${truncated ? styles.cut : ''}`}>
              <div className={styles.number}>{index + 1}</div>
              <div className={`${styles.number} ${styles.score}`}>{entry.metricScore}</div>
              <div className={styles.resultinfo}>
                <div className={styles.textfields}>
                  <div>
                    {entry.documentTextToBeIndexed}
                    {showMeta && (
                      <span className={styles.documentKey}>{entry.documentKey}.{entry.segmentNumber}</span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Search;
