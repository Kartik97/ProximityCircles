import { BaseDashboard } from "@microsoft/teamsfx-react";
import ListWidget from "../widgets/ListWidget";
import DescriptionWidget from "../widgets/DescriptionWidget";
export default class SampleDashboard extends BaseDashboard {
  constructor(props) {
    super(props);
    this.state = {
      description:null
    };
  }

  setDescription = (desc) => {
    this.setState(desc);
  }

  layout() {
    return (
      <>
        <ListWidget desc={this.setDescription}/>
        
        <DescriptionWidget description={this.state.description}/>
      </>
    );
  }
}
