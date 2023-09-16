import OtherRoute from "../../routes/OtherRoute";
import OverviewRoute from "../../routes/OverviewRoute";

function PageView() {
    return (
      <div className="PageContent">
        <OverviewRoute />
        {/* <OtherRoute /> */}
      </div>
    );
  }
  
  export default PageView;
  