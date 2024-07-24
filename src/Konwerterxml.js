import React, { useState } from 'react';
import axios from 'axios';

function Konwerterxml() {
  const [file, setFile] = useState(null);
  const [downloadLink, setDownloadLink] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    axios.post('http://localhost:3001/upload', formData, {
      responseType: 'blob'
    })
    .then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadLink(url);
    })
    .catch((error) => {
      console.error('There was an error!', error);
    });
  };

  return (
    <div className="App">
      <h1>Upload XML File</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".xml" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {downloadLink && (
        <div>
          <a href={downloadLink} download="output.txt">Download Converted TXT File</a>
        </div>
      )}
    </div>
  );
}

export default Konwerterxml;
