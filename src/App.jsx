import React, { useState } from 'react';
import axios from 'axios';
import './output.css';

const App = () => {
  const [query, setQuery] = useState('');
  const [youtubeResults, setYoutubeResults] = useState([]);
  const [googleResults, setGoogleResults] = useState([]);
  const [scholarResults, setScholarResults] = useState([]);
  const [filter, setFilter] = useState('all'); 
  const [sortOption, setSortOption] = useState('relevance'); 

  const search = async () => {
    const youtubeResponse = await axios.get(`http://localhost:5000/api/youtube?q=${query}&part=snippet,statistics`);

    setYoutubeResults(youtubeResponse.data);

    const googleResponse = await axios.get(`http://localhost:5000/api/google-search?q=${query}`);
    setGoogleResults(googleResponse.data);
    
    try {
     
      const pubMedResponse = await axios.get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}&retmode=json`);
      const articleIds = pubMedResponse.data.esearchresult.idlist;
  
      if (articleIds.length > 0) {
        
        const articleDetailsResponse = await axios.get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${articleIds.join(',')}&retmode=json`);
        const articles = articleDetailsResponse.data.result;
  
        
        const formattedArticles = Object.keys(articles)
          .filter((key) => key !== 'uids') 
          .map((key) => articles[key]);
  
        
        setScholarResults(formattedArticles);
      }
    } catch (error) {
      console.error("Error fetching PubMed articles:", error);
    } 
  };

  const handleFilterChange = (filterOption) => {
    setFilter(filterOption); 
  };
  const handleSortChange = (sortValue) => {
    setSortOption(sortValue);
  };

  const sortedYoutubeResults = [...youtubeResults].sort((a, b) => {
    if (sortOption === 'mostViewed') {
      return b.statistics.viewCount - a.statistics.viewCount;
    } else if (sortOption === 'mostLiked') {
      return b.statistics.likeCount - a.statistics.likeCount;
    } else if (sortOption === 'mostRecent') {
      return new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt);
    } else {
      return 0; 
    }
  });
  

  const filteredYoutubeResults = filter === 'youtube' || filter === 'all' ? youtubeResults : [];
  const filteredGoogleResults = filter === 'google' || filter === 'all' ? googleResults : [];
  const filteredScholarResults = filter === 'scholar' || filter === 'all' ? scholarResults : [];

  const getContentType = (link) => {
    if (link.includes('.pdf')) {
      return 'PDF Document';
    } else if (link.includes('.doc') || link.includes('.docx')) {
      return 'Word Document';
    } else if (link.includes('youtube.com')) {
      return 'Video';
    } else {
      return 'Visit Website';
    }
  };

  const formatViewCount = (viewCount) => {
    if (viewCount >= 1000000) {
      return (viewCount / 1000000).toFixed(1) + 'M';
    } else if (viewCount >= 1000) {
      return (viewCount / 1000).toFixed(1) + 'K';
    } else {
      return viewCount;
    }
  };
  

  
  return (
    <div className="p-4 bg-lime-400 min-h-screen flex flex-col justify-center align-middle">
      <div className="max-w-lg mx-auto">
        <input
          className=" p-2 rounded-[.25rem] w-full mt-28"
          type="text"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          
        />
        <button onClick={search} className="bg-green-900 text-white px-4 py-2 rounded mt-2  ">
          Search
        </button>




       
        <div className="mt-4 ">
          <button
            onClick={() => handleFilterChange('all')}
            className={`mr-2   p-2 rounded ${filter === 'all' ? 'bg-green-700 text-white' : 'bg-gray-300 '}`}
          >
            All Results
          </button>
          <button
            onClick={() => handleFilterChange('youtube')}
            className={`mr-2 p-2 rounded ${filter === 'youtube' ? 'bg-green-700 text-white' : 'bg-gray-300'}`}
          >
            YouTube Results
          </button>
          
          <button
            onClick={() => handleFilterChange('google')}
            className={`mr-2 p-2 rounded ${filter === 'google' ? 'bg-green-700 text-white' : 'bg-gray-300'}`}
          >
            Google Results
          </button>
          <button
            onClick={() => handleFilterChange('scholar')}
            className={`p-2 mt-2 rounded ${filter === 'scholar' ? 'bg-green-700 text-white' : 'bg-gray-300'}`}
          >
            Academic Papers
          </button>
        </div>

        
        <div className="mt-10">
        {filter === 'youtube' && sortedYoutubeResults.length > 0 && (
  <>
    <h2 className="text-[2.5rem] font-bold">YouTube Videos</h2>
    
    <div className="mt-4">
  <button
    onClick={() => handleSortChange('mostViewed')}
    className={`mr-2 p-2 rounded ${sortOption === 'mostViewed' ? 'bg-blue-700 text-white' : 'bg-gray-300'}`}
  >
    Most Viewed
  </button>
  <button
    onClick={() => handleSortChange('mostLiked')}
    className={`mr-2 p-2 rounded ${sortOption === 'mostLiked' ? 'bg-blue-700 text-white' : 'bg-gray-300'}`}
  >
    Most Liked
  </button>
  <button
    onClick={() => handleSortChange('mostRecent')}
    className={`p-2 rounded ${sortOption === 'mostRecent' ? 'bg-blue-700 text-white' : 'bg-gray-300'}`}
  >
    Most Recent
  </button>
</div>

    <ul>
      { sortedYoutubeResults.map((video) => (
        <li key={video.id.videoId} className="mt-3 mb-3 hover:font-bold bg-lime-200 text-blue-900 p-1 font-mono rounded-[.25rem]">
          <a href={`https://www.youtube.com/watch?v=${video.id.videoId}`} className="p-3" target="_blank" rel="noreferrer">
            {video.snippet.title}
            <p className="text-gray-500">
              Date: {video.snippet.publishedAt.substring(0, 10)}
              <br /> Channel: {video.snippet.channelTitle}
              <br /> Views: {formatViewCount(video.statistics.viewCount)}
            </p>
            <p>
              <img src={video.snippet.thumbnails.medium.url} alt="Thumbnail" className="w-25 h-20 mb-2" />
            </p>
          </a>
        </li>
      ))}
    </ul>
  </>
)}

          {filteredGoogleResults.length > 0 && (
            <>
              <h2 className="text-[2.5rem] font-bold">Google Search Results</h2>
              <ul>
                {filteredGoogleResults.map((item) => (
                  <li key={item.link} className="mt-3 mb-3  text-blue-900 bg-lime-200 hover:font-bold  p-4 font-mono rounded-[.25rem]">
                    <a href={item.link} target="_blank" rel="noreferrer">
                      {item.title}({getContentType(item.link)})
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
          {filteredScholarResults.length > 0 && (
            <>
              <h2 className="text-[2.5rem] font-bold">Academic Papers</h2>
              
              <ul>
      {filteredScholarResults.map((article) => (
        <li key={article.uid} className="mt-3 mb-3 text-blue-900 bg-lime-200 hover:font-bold p-4 font-mono rounded-[.25rem]">
          <a href={`https://pubmed.ncbi.nlm.nih.gov/${article.uid}`} target="_blank" rel="noreferrer">
            {article.title} (Visit Article)
          </a>
        </li>
      ))}
    </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
