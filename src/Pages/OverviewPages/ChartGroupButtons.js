import { getClientDieselLitresData, getClientUtilityEnergyData, getTotalCostBarChartData } from "../../redux/actions/overview/overview.action";
import { connect, useSelector } from "react-redux";
import { Button } from "antd";


function ChartGroupButtons( {buttons, isSelectChart, setIsSelectChart} ) {

  return (
    <>
      <div className="##########">
          { buttons.map((text, index) => {
              return <Button className="chart_buttons"
                onClick={() => {
                    setIsSelectChart(index)
                    console.log("Somethign has been clicked =>>>", index);
                }}
              >
                {text.icon}
                {text.label}
              </Button>
            })
          }
      </div>
    </>
  );
}

const mapDispatchToProps = {
  getClientDieselLitresData,
};

const mapStateToProps = (state) => ({
  overviewPage: state.overviewPage,
  auth: state.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(ChartGroupButtons);
