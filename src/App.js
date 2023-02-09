// 1. Install dependencies DONE
// 2. Import dependencies DONE
// 3. Setup webcam and canvas DONE
// 4. Define references to those DONE
// 5. Load handpose DONE
// 6. Detect function DONE
// 7. Drawing utilities DONE
// 8. Draw functions DONE

import React, { useRef, useState } from "react";
// import logo from './logo.svg';
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import "./App.css";
import { drawHand } from "./utilities";
import * as fp from "fingerpose"

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [text, setText] = useState(null);

  const runHandpose = async () => {
    const net = await handpose.load();
    console.log("Handpose model loaded.");
    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 100);
  };

  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      const hand = await net.estimateHands(video);
      console.log(hand);

      //Gesture Detection
      if(hand.length>0){
        const GE = new fp.GestureEstimator([
          fp.Gestures.ThumbsUpGesture,
          fp.Gestures.VictoryGesture,
        ])

        const gesture = await GE.estimate(hand[0].landmarks, 8)
        console.log(gesture.gestures[0].name)
        setText(gesture.gestures[0].name)
      }

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);
    }
  };

  runHandpose();

  return (
    <div className="App">
        <Webcam
          ref={webcamRef}
          mirrored = "false"
          minScreenshotHeight = "808"
          minScreenshotWidth = "720"
          style={{
            position: "absolute",
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 1077,
            height: 808,
            filter: "grayscale(100%)",
          }}
        />

        <canvas
          ref={canvasRef}
          className="canvas"
          style={{
            position: "absolute",
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 1077,
            height: 808,
            transform: "scale(-1, 1)",
          }}
        />
        <div className="textContainer">
          <span className="text">{text}</span>
        </div>
    </div>
  );
}

export default App;
