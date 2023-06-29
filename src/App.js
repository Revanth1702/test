import React from 'react';
import './App.css';
//import video1 from './1.mp4';
import video2 from './2.mp4';
import video3 from './3.mp4';
import video4 from './4.mp4';
import video5 from './5.mp4';
import video6 from './6.mp4';
import VideoPlayer from './VideoPlayer';
function App() {
    const video1 = "https://samplelib.com/lib/preview/mp4/sample-15s.mp4"
const videoList = [
video1,
video2,
video3,
video4,
video5,
video6
];
return (
<div className="App">
<header className="App-header">
<VideoPlayer videoList={videoList} />
</header>
</div>
);
}
export default App;

