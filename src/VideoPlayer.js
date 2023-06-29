import React, { useState, useEffect, useRef } from 'react';
import './VideoPlayer.css';
import { isCompositeComponent } from 'react-dom/test-utils';

function VideoPlayer({ videoList }) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef(null);
  const [videoDurations, setVideoDurations] = useState([]);
  const [thumbnails, setThumbnails] = useState([]);
  const [temp, setTemp] = useState(0);

  useEffect(() => {
    videoRef.current.src = videoList[currentVideoIndex];
    videoRef.current.play();
    videoRef.current.addEventListener('ended', handleVideoEnd);

    return () => {
      videoRef.current.removeEventListener('ended', handleVideoEnd);
    };
  }, [currentVideoIndex, videoList]);

  useEffect(() => {
    videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      videoRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    generateThumbnails();
  }, [videoList]);

  const generateThumbnails = async () => {
    try {
      const thumbnailPromises = videoList.map(generateVideoThumbnail);
      const thumbnails = await Promise.all(thumbnailPromises);
      setThumbnails(thumbnails);
    } catch (error) {
      console.error('Error generating thumbnails:', error);
    }
  };

  const generateVideoThumbnail = (videoUrl) => {
    return new Promise((resolve, reject) => {
      const videoElement = document.createElement('video');
      videoElement.src = videoUrl;

      videoElement.addEventListener('loadedmetadata', () => {
        const duration = videoElement.duration;
        const captureTime = duration > 10 ? 10 : duration / 2;
        videoElement.currentTime = captureTime;

        videoElement.addEventListener('seeked', () => {
          const canvas = document.createElement('canvas');
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
          const context = canvas.getContext('2d');
          context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          const thumbnailDataUrl = canvas.toDataURL();
          resolve(thumbnailDataUrl);
        });

        videoElement.addEventListener('error', reject);
      });
    });
  };

  const handleVideoEnd = () => {
    setCurrentVideoIndex((currentVideoIndex + 1) % videoList.length);
  };

  const handleThumbnailClick = (index) => {
    setCurrentVideoIndex(index);
  };


  const getVideoDuration = (videoSrc) => {
    return new Promise((resolve, reject) => {
      const videoElement = document.createElement('video');
      videoElement.src = videoSrc;
  
      videoElement.addEventListener('loadedmetadata', () => {
        const duration = videoElement.duration;
        resolve(duration);
      });
  
      videoElement.addEventListener('error', reject);
    });
  };
  
  const handleLoadedMetadata = () => {
    const durations = videoList.map((video) => getVideoDuration(video));

    // const realdurations = durations.map((duration) => {return duration.then(result => {return result})});
    async function getRealDurations() {
      const realdurations = await Promise.all(durations.map(duration => duration));
      console.log("hi",realdurations);
      setVideoDurations(realdurations);
    }
    
    getRealDurations();
    
  };

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="VideoPlayer" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
      <video
        ref={videoRef}
        controls
        style={{
          width: '800px',
          height: '400px',
          marginTop: '20px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      />
      <div className="ThumbnailsContainer">
        <h2
          style={{
            position: 'sticky',
            top: '0',
            backgroundColor: '#fff',
            padding: '10px',
            marginBottom: '10px',
          }}
        >
          Chapters
        </h2>
        <div
          style={{
            overflowX: 'auto',
            // display: 'flex',
            flexWrap: 'nowrap',
            paddingBottom: '10px',
          }}
        >
          {videoList.map((video, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginRight: '10px',
              }}
            >
              <img
                src={thumbnails[index]}
                alt={`Thumbnail ${index}`}
                style={{
                  width: '130px',
                  height: '80px',
                  marginRight: '10px',
                  cursor: 'pointer',
                  border: currentVideoIndex === index ? '2px solid #333' : '1px solid #ccc',
                  borderRadius: '4px',
                  transition: 'border-color 0.3s',
                  marginBottom: '20px',
                }}
                onClick={() => handleThumbnailClick(index)}
              />
              <a
                href="#"
                onClick={() => handleThumbnailClick(index)}
                className={currentVideoIndex === index ? 'highlighted' : ''}
                style={{
                  color: currentVideoIndex === index ? '#333' : '#777',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '20px',
                }}
              >
                {formatDuration(videoDurations[index] || 0)}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
