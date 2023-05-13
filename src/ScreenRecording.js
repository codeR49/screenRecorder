import React, { useState } from "react";
import RecordRTC from "recordrtc";
import "../css/ScreenRecording.css";
import ScreenRecordPreviewModal from "./ScreenRecordPreviewModal";
import { Button, Row, Col, Container, Card, CardBody } from "reactstrap";

let recorder;

const ScreenRecording = () => {
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [isOpenVideoModal, setIsOpenVideoModal] = useState(false);
  const [screen, setScreen] = useState(null);
  const [camera, setCamera] = useState(null);
  const [startDisable, setStartDisable] = useState(false);
  const [stopDisable, setStopDisable] = useState(true);
  const [loadModal, setLoadModal] = useState(false);
  const [recordPreview, setRecordPreview] = useState();

  const captureCamera = (cb) => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: false,
      })
      .then(cb);
  };

  const startScreenRecord = async () => {
    await setStopDisable(false);
    await setStartDisable(true);
    captureScreen((screen) => {
      captureCamera(async (camera) => {
        screen.width = window.screen.width;
        screen.height = window.screen.height;
        screen.fullcanvas = true;
        camera.width = 320;
        camera.height = 240;
        camera.top = screen.height - camera.height;
        camera.left = screen.width - camera.width;
        setScreen(screen);
        setCamera(camera);
        recorder = RecordRTC([screen, camera], {
          type: "video",
        });
        recorder.startRecording();
        recorder.screen = screen;
      });
    });
  };

  const captureScreen = (callback) => {
    invokeGetDisplayMedia(
      (screen) => {
        addStreamStopListener(screen, () => {});
        callback(screen);
      },
      (error) => {
        console.error(error);
        alert(
          "Unable to capture your screen. Please check console logs.\n" + error
        );
        setStopDisable(true);
        setStartDisable(false);
      }
    );
  };

  const stopLocalVideo = async (screen, camera) => {
    [screen, camera].forEach(async (stream) => {
      stream.getTracks().forEach(async (track) => {
        track.stop();
      });
    });
  };

  const invokeGetDisplayMedia = (success, error) => {
    var displaymediastreamconstraints = {
      video: {
        displaySurface: "monitor",
        logicalSurface: true,
        cursor: "always",
      },
    };
    displaymediastreamconstraints = {
      video: true,
      audio: true,
    };
    if (navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices
        .getDisplayMedia(displaymediastreamconstraints)
        .then(success)
        .catch(error);
    } else {
      navigator
        .getDisplayMedia(displaymediastreamconstraints)
        .then(success)
        .catch(error);
    }
  };

  const addStreamStopListener = (stream, callback) => {
    stream.addEventListener(
      "ended",
      () => {
        callback();
        callback = () => {};
      },
      false
    );
    stream.addEventListener(
      "inactive",
      () => {
        callback();
        callback = () => {};
      },
      false
    );
    stream.getTracks().forEach((track) => {
      track.addEventListener(
        "ended",
        () => {
          callback();
          callback = () => {};
        },
        false
      );
      track.addEventListener(
        "inactive",
        () => {
          callback();
          callback = () => {};
        },
        false
      );
    });
    stream.getVideoTracks()[0].onended = () => {
      stop();
    };
  };

// stop screen recording
const stop = async () => {
    await setStartDisable(false);
    recorder.stopRecording(stopRecordingCallback);
  };

//destory screen recording
const stopRecordingCallback = async () => {
    await stopLocalVideo(screen, camera);
    let recordedVideoUrl;
    if (recorder.getBlob()) {
      
        setRecordPreview(recorder.getBlob()),
     
      recordedVideoUrl = URL.createObjectURL(recorder.getBlob());
    }
    
      setRecordedVideoUrl(recordedVideoUrl),
      setScreen(null),
      setIsOpenVideoModal(true),
      setStartDisable(false),
      setStopDisable(true),
      setCamera(null),
    
    recorder.screen.stop();
    recorder.destroy();
    recorder = null;
  };

//close video modal
const videoModalClose = () => {
    
      setIsOpenVideoModal(false);
    
  };
 //open load alert
 const openModal = async () => {
    await setLoadModal(false);
  };

  return (
    <div>
      <Container className="pt-3">
        <div className="centerCard">
          <div className="shadow">
            <Card>
              <CardBody>
                <Row>
                  <Col sm={12}>
                    <h3 className="text-dark pb-2 textShadowHead text-center">
                      Screen Recording
                    </h3>
                    <h5 className="text-primary my-2">
                      Follow the below steps to do screen recording
                    </h5>
                    <p className="mt-0 mb-1 textShadowPara">
                      {" "}
                      To start recording click on start recording
                    </p>
                    <p className="mt-0 mb-1 textShadowPara pr-1">
                      {" "}
                      Select the screen type to start recording
                    </p>
                    <p className="mt-0 mb-1 textShadowPara pl-1">
                      {" "}
                      Click on share button to confirm recording
                    </p>
                    <p className="pb-3 mt-0 mb-1 textShadowPara">
                      {" "}
                      To stop recording click on stop recording
                    </p>
                  </Col>
                  <Col sm={12} className="text-center">
                    <Button
                      color="primary"
                      className="btn-1"
                      outline
                      onClick={() => startScreenRecord()}
                      disabled={startDisable}
                    >
                      Start Recording
                    </Button>
                    <Button
                      color="primary"
                      className="btn-2"
                      onClick={() => stop()}
                      disabled={stopDisable}
                    >
                      Stop Recording
                    </Button>
                    {this.state.startDisable && (
                      <h3 className="text-success pt-2">Recording..</h3>
                    )}
                    {this.state.startDisable && (
                      <h3 className="text-warning pt-2">
                        Please dont refersh page.
                      </h3>
                    )}
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </div>
        </div>
        <ScreenRecordPreviewModal
          isOpenVideoModal={isOpenVideoModal}
          videoModalClose={videoModalClose}
          recordedVideoUrl={recordedVideoUrl}
          downloadScreenRecordVideo={downloadScreenRecordVideo}
          recorder={recordPreview}
        />
      </Container>
    </div>
  );
}

export default ScreenRecording;