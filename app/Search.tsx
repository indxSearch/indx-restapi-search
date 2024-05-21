'use client'

/*
SEARCH for RestAPI
For V3.3 with updated API

See docs.indx.co to learn more.
Go to auth.indx.co to register for a developer account
*/

import React, { useState, useEffect } from 'react';
import styles from './Search.module.css';


interface SearchProps {
  url?: string; // Url to API. Default https://api.indx.co/api/
  token?: string; // Formatted as Bearer + token. Retrieved when logging in.
  results?: number; // Number of results to be returned
  dataset?: string; // Dataset name
  applyCoverage: boolean; // Cover function that detects whole, concatenated or incomplete words.
  placeholderText?: string; // Placeholder for the input field
  dataSetDesc?: string; // Description title of the dataset in use
  metricScoreMin?: number;
  doTruncate?: boolean; // Set false if you want to always show results
  showMeta?: boolean; // Set true if you want to display information about key and segment numbers
  removeDuplicates?: boolean; // Set false if you want to show multiple results with the same key.

  // Coverage settings. Advanced settings.
  levenshteinMaxWordSize?: number;
  MinWordSize?: number;
  coverageMinWordHitsAbs?: number;
  coverageMinWordHitsRelative?: number;
  coverageQLimitForErrorTolerance?: number;
  coverageLcsErrorToleranceRelativeq?: number;
  coverWholeQuery?: boolean;
  coverWholeWords?: boolean;
  coverFuzzyWords?: boolean;
  coverJoinedWords?: boolean;
  coverPrefixSuffix?: boolean;
  minTruncationMatch?: number;
  truncationStrictness?: number;

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
  url = "https://api.indx.co/api/",
  token = "",
  dataset = "undefined",
  results = 20,
  applyCoverage = true,
  placeholderText = "Search",
  metricScoreMin = 30,
  doTruncate = true,
  showMeta = false,
  removeDuplicates = true,

  // COVERAGE SETUP (Default values)
  // Only activates with applyCoverage true
  levenshteinMaxWordSize = 20,
  MinWordSize = 2,
  coverageMinWordHitsAbs = 1,
  coverageMinWordHitsRelative = 0,
  coverageQLimitForErrorTolerance = 5,
  coverageLcsErrorToleranceRelativeq = 0.2,
  coverWholeQuery = true,
  coverWholeWords = true,
  coverFuzzyWords = true,
  coverJoinedWords = true,
  coverPrefixSuffix = true,
  minTruncationMatch = 3,
  truncationStrictness = 1

}) => {
  const [records, setRecords] = useState<Record[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [truncateIndex, setTruncateIndex] = useState<number>(-1);

  const callAPI = async (queryText: string) => {
    try {
      const response = await fetch(`${url}Search/${dataset}`, {
        cache: "no-cache",
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applyCoverage: applyCoverage,
          keyExcludeFilter: null,
          keyIncludeFilter: null,
          logPrefix: "",
          maxNumberOfRecordsToReturn: results,
          removeDuplicates: removeDuplicates,
          queryText: queryText,
          timeOutLimitMilliseconds: 1000, //timeout after 1s
          coverageSetup: {
            levenshteinMaxWordSize: levenshteinMaxWordSize,
            MinWordSize: MinWordSize,
            coverageMinWordHitsAbs: coverageMinWordHitsAbs,
            coverageMinWordHitsRelative: coverageMinWordHitsRelative,
            coverageQLimitForErrorTolerance: coverageQLimitForErrorTolerance,
            coverageLcsErrorToleranceRelativeq: coverageLcsErrorToleranceRelativeq,
            coverWholeQuery: coverWholeQuery,
            coverWholeWords: coverWholeWords,
            coverFuzzyWords: coverFuzzyWords,
            coverJoinedWords: coverJoinedWords,
            coverPrefixSuffix: coverPrefixSuffix,
            minTruncationMatch: minTruncationMatch,
            truncationStrictness: truncationStrictness
          },
          numberOfRecordsForAppliedAlgorithm: 500,
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
            {showMeta && (<div className={styles.metainfo}>Url: {url}</div>)}
            <div className={styles.metainfo}>Dataset: {dataset}</div>
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
