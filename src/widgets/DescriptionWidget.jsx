import "../styles/ListWidget.css";
import { Text } from "@fluentui/react-components";
import { BaseWidget } from "@microsoft/teamsfx-react";


export default class DescriptionWidget extends BaseWidget {


 header(){
  return (
    <div className="listheader">
      <Text size={400}>  Description    </Text>
     
      </div>
  )
 }


  body() {

    let description = this.props.description;
    return (
      <div className="desc-body">
        <h4> {description} </h4>
      </div>
    );
  }

}