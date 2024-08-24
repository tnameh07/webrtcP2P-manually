import logo from "./logo.svg";
import "./App.css";
import io from "socket.io-client";
import { useEffect, useRef } from "react";

const socket = io("/webRTCPeers", {
  path: "/webrtc",
});

function App() {
  const localVideoRef = useRef();
  const RemoteVideoRef = useRef();
  const textRef = useRef();
  const candidates = useRef([]);
  const pc = useRef(new RTCPeerConnection(null));
  useEffect(() => {
    socket.on("connection-success", (success) => {
      console.log(success);
    });

    socket.on('sdp', (data)=>{
      textRef.current.value = JSON.stringify(data.sdp)
      console.log(data);
      
    })

    socket.on('candidate' , (candidate)=>{
      console.log(candidate);
      candidates.current= [...candidates.current, candidate]
    })
    const constrains = {
      audio: false,
      video: true,
    };

    navigator.mediaDevices
      .getUserMedia(constrains)
      .then((stream) => {
        localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach((track) => {
          _pc.addTrack(track, stream);
        });
      })
      .catch((e) => console.log("error getting media : ", e));

    const _pc = new RTCPeerConnection(null);

    _pc.onicecandidate = (e) => {
      if (e.candidate) 
        {console.log(JSON.stringify(e.candidate));
          socket.emit('candidate',e.candidate)
        }
    };
    _pc.onconnectionstatechange = (e) => {
      console.log(JSON.stringify(e));
    };

    _pc.ontrack = (e) => {
      RemoteVideoRef.current.srcObject = e.streams[0];
    };
    pc.current = _pc;
  }, []);

  const createOffer = () => {
    pc.current
      .createOffer({
        offerToReceiveVideo: 1,
        offerToreceiveAudio: 1,
      })
      .then((sdp) => {
        console.log(JSON.stringify(sdp));
        pc.current.setLocalDescription(sdp);

        //send sdp to the server
        socket.emit("sdp", {
          sdp,
        });
      })
      .catch((e) => console.log(e));
  };

  const createAnswer = () => {
    pc.current
      .createAnswer({
        offerToReceiveVideo: 1,
        offerToreceiveAudio: 1,
      })
      .then((sdp) => {
        console.log(JSON.stringify(sdp));
        pc.current.setLocalDescription(sdp);

        //send the sdp to the offering peer
        socket.emit('sdp', {
          sdp
        })
      })
      .catch((e) => console.log(e));
  };

  const setRemoteDescription = () => {
    const sdp = JSON.parse(textRef.current.value);
    console.log(sdp);
    pc.current.setRemoteDescription(new RTCSessionDescription(sdp));
  };
  const addCandidate = () => {
    // const candidate = JSON.parse(textRef.current.value);
    // console.log("Adding Candidate ...", candidate);
candidates.current.forEach(candidate =>{
  console.log(candidate);
  pc.current.addIceCandidate(new RTCIceCandidate(candidate));
  
})
    // pc.current.addIceCandidate(new RTCIceCandidate(candidate));
  };
  return (
    <div className="App" style={{ margin: 10 }}>
      <video
        style={{
          width: 240,
          height: 240,
          margin: 5,
          backgroundColor: "black",
        }}
        ref={localVideoRef}
        autoPlay
      ></video>
      <video
        style={{
          width: 240,
          height: 240,
          margin: 5,
          backgroundColor: "black",
        }}
        ref={RemoteVideoRef}
        autoPlay
      ></video>

      <br />
      <button onClick={createOffer}>Create Offer</button>
      <button onClick={createAnswer}>Create Answer</button>
      <br />

      <textarea ref={textRef}> </textarea>
      <br />

      <button onClick={setRemoteDescription}> Set Remote Discription</button>
      <button onClick={addCandidate}> Add Candidates</button>
    </div>
  );
}

export default App;
