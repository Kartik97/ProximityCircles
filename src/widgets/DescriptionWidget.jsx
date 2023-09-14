import "../styles/ListWidget.css";

import { BaseWidget } from "@microsoft/teamsfx-react";


export default class DescriptionWidget extends BaseWidget {


 header(){
  return (
    <div> Your Description</div>
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