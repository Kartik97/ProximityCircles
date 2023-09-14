import "../styles/ListWidget.css";
import { Button, Text } from "@fluentui/react-components";
import { List28Filled, Mic32Regular, MicOff32Regular } from "@fluentui/react-icons";
import { BaseWidget } from "@microsoft/teamsfx-react";
import TopicListWidget from "./TopicListWidget";
import { getListData } from "../services/listService";
import React, { createRef } from 'react';
import OpenAI from "openai";

const openai = new OpenAI(
  {apiKey: "745fd7c72ad84b84b77cc1145d2f1668",dangerouslyAllowBrowser: true,baseURL:"https://proximitycircles.openai.azure.com/"}
);

class ListWidget extends BaseWidget {
  
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      selectedItem: null, // Track the selected item
      // permission: true,
      // stream:null,
      recordingStatus:"inactive",
      audio:null,
      // audioChunks: []
      audioFile:null
    };
    this.mediaRecorder = createRef();
    this.stream = createRef();
    // this.recordingStatus = createRef();
    this.permission = createRef();
    this.mimeType = "audio/webm";
    this.audioChunks = createRef();
  }

  async componentDidMount() {
    const data = await this.getData();
    this.setState({ data: data.data });
  }

  async getData() {
    return { data: getListData() };
  }

  openTopics(item) {
    // Set the selected item when a button is clicked
    console.log("Entered openTopics")
    this.setState({ selectedItem: item });
  }

  setPermission(selectedPermission) {
    this.permission.current = selectedPermission;
  }

  setStream(selectedStream) {
    this.setState({ stream: selectedStream});
  }

  setAudioChunks(localAudioChunks){
    // this.setState({ audioChunks: localAudioChunks});
    this.audioChunks.current = localAudioChunks;
  }

  setRecordingStatus(status) {
    this.setState({ recordingStatus: status})
  }

  async setAudioControls() {
    console.log("ASAS");
    if(this.permission.current === null || !this.permission.current) {await this.getMicrophonePermission();}
    // TODO: add toggling of record and stop record button


    if (this.permission.current) {
      // console.log("Inside state permission",this.permission.current,this.recordingStatus.current);
      if(this.state.recordingStatus !== "recording"){
        console.log("Statryed recording");
        this.startRecording();
      }
      else{
        this.stopRecording();
      }
    }
  }

  setAudio(audioUrl) {
    this.setState({ audio: audioUrl});
  }

  async getMicrophonePermission(){
    if ("MediaRecorder" in window) {
        try {
            const streamData = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false,
            });
            console.log(streamData);
            this.setPermission(true);
            // this.setStream(streamData);
            this.stream.current = streamData;
        } catch (err) {
            alert(err.message);
        }
    } else {
        alert("The MediaRecorder API is not supported in your browser.");
    }
  }

  startRecording() {
    this.setRecordingStatus("recording");
    // this.recordingStatus.current = "recording";
    //create new Media recorder instance using the stream
    console.log("startrecording",this.stream.current);
    let media = new MediaRecorder(this.stream.current, { type: this.state.mimeType });
    console.log("AAAAAAA");
    //set the MediaRecorder instance to the mediaRecorder ref
    this.mediaRecorder.current = media;
    //invokes the start method to start the recording process
    this.mediaRecorder.current.start();
    let localAudioChunks = [];
    this.mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      localAudioChunks.push(event.data);
      console.log("Inside mediaRecorder",event.data);
      this.setAudioChunks(localAudioChunks);
    };
    console.log("Chuncks",localAudioChunks);
  }

  stopRecording() {
    this.setRecordingStatus("inactive");
    // this.recordingStatus.current = "stopped";
    //stops the recording instance
    this.mediaRecorder.current.stop();
    this.mediaRecorder.current.onstop = () => {
      //creates a blob file from the audiochunks data
      const audioBlob = new Blob(this.audioChunks.current, { type: this.mimeType });
      //creates a playable URL from the blob file.
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log(audioUrl, audioBlob);
      this.setAudio(audioUrl);
      this.setAudioChunks([]);

      const downloadLink = document.createElement('a');
      downloadLink.style.display = 'none';

      // Set the href attribute to the Blob URL
      downloadLink.href = audioUrl;

      // Get the current timestamp in milliseconds
      const timestamp = new Date().getTime();

      // Use the timestamp as a seed for Math.random()
      // This will produce a random number between 0 and 1
      const random = Math.random();

      // Use the random number to generate a larger range, for example, between 1 and 100
      const min = 1;
      const max = 100000;
      const randomNumberInRange = Math.floor(random * (max - min + 1)) + min;

      // Create a filename with the random number and timestamp
      const filename = `audio_file_${randomNumberInRange}_${timestamp}.mp3`;
      
      // Specify the desired filename for the downloaded file
      downloadLink.setAttribute('download', filename);

      // Append the <a> element to the document
      document.body.appendChild(downloadLink);

      // Programmatically trigger a click event on the <a> element to initiate the download
      downloadLink.click();

      // Remove the <a> element from the DOM (optional)
      document.body.removeChild(downloadLink);
    };
  }

  handleFileUpload(e){
    const file = e.target.files[0];
    this.setAudioFile(file);
  }

  setAudioFile(file){
    this.setState({audioFile:file});
  }

  async handleTranscription() {
    // try {
    //   const formData = new FormData();
    //   formData.append('audio', audioFile);
  
    //   const response = await axios.post(
    //     'https://api.openai.com/v1/audio/transcriptions',
    //     formData,
    //     {
    //       headers: {
    //         'Authorization': 'Bearer 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',
    //         'Content-Type': 'multipart/form-data',
    //       },
    //     }
    //   );
  
    //   const transcription = response.data.choices[0].text;
    //   console.log('Transcription:', transcription);
    // } catch (error) {
    //   console.error('Error:', error);
    // }
    console.log("audiofile",this.state.audioFile);
    const transcription = await openai.audio.transcriptions.create({
      file: this.state.audioFile,
      model: "whisper-1",
    });

    console.log("Transcription",transcription.text);
  };
  

  render() {
    console.log("ListWidget",this.props.desc);
    return (
      <div>
        {this.header()}
        {this.body()}
        {this.footer()}
        {this.state.selectedItem && (
          <TopicListWidget data={this.state.selectedItem.topics} desc={this.props.desc}/>
        )}
      </div>
    );
  }

  header() {
    return (
      <div>
        <List28Filled />
        <Text>Your Teams</Text>
        {(this.state.recordingStatus !== "recording") ? <Button icon={<Mic32Regular />} appearance="transparent" onClick={()=> this.setAudioControls()}/>:<Button icon={<MicOff32Regular />} appearance="transparent" onClick={()=> this.setAudioControls()}/>}
      </div>
    );
  }

  body() {
    return (
      <div className="list-body">
        
        {this.state.data?.map((t) => (
          <div key={`${t.id}-div`}>
            <div className="divider" />
            <Text className="title">{t.title}</Text>
            <Button onClick={() => this.openTopics(t)}>View Topics</Button>
            {/* {this.state.audio && <audio controls src={this.state.audio}></audio>} */}
            {/* {this.state.audio && <input type="file" accept="audio/*" onChange={(e) => this.handleFileUpload(e)} />} */}
            {/* {this.state.audioFile && <button onClick={() => this.handleTranscription()}>Transcribe</button>} */}
          </div>
        ))}
      </div>
    );
  }

  footer() {
    //return <Button appearance="primary">View Details</Button>;
    return null;
  }
}

export default ListWidget;
