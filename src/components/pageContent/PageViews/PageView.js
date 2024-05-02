import AuthRoute from "../../routes/AuthRoute";
import OverviewRoute from "../../routes/OverviewRoute";

function PageView() {
    return (
      // <div className="PageContent">
      <div className="PageContent">
        <OverviewRoute />
        {/* <OtherRoute /> */}
      </div>
    );
  }
  
  export default PageView;
  