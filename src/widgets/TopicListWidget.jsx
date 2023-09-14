import "../styles/ListWidget.css";
import { BaseWidget } from "@microsoft/teamsfx-react";
import { Button,Text } from "@fluentui/react-components";


import React from 'react';

class TopicListWidget extends BaseWidget {
  handleTopicClick = (topic,desc) => {
    desc({description:topic.description});
  };

  render() {
    const  topics  = this.props.data;
    console.log("TopicList",this.props.desc)
    return (
      <div className="list-body"> {/* Reuse the same class as ListWidget */}
          <Text className="title">  Topics <br></br></Text>
          {topics?.map((topic, index) => (
            <div key={index} > {/* Reuse the same class as ListWidget */}
            <div className="divider" />
              <Button onClick={() => this.handleTopicClick(topic,this.props.desc)}>
                {topic.title}
              </Button>
            </div>
          ))}
      </div>
    );
  }
}


export default TopicListWidget;
