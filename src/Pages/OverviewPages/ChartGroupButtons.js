import { getClientDieselLitresData } from "../../redux/actions/overview/overview.action";
import { connect } from "react-redux";
import { Button, Select } from "antd";
import { useEffect, useState } from "react";

function ChartGroupButtons({ buttons, isSelectChart, setIsSelectChart }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();

    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="chart_buttons_container_mobile">
        <Select
          style={{ width: '100%', height: '45px', fontSize: '12px'}}
          value={isSelectChart}
          onChange={(value) => setIsSelectChart(value)}
          options={buttons.map((button, index) => ({
            value: index,
            label: (
              <span style={{ fontSize: '15px', fontWeight: '500' }}>
                {button.icon} {button.label}
              </span>
            )
          }))}
        />
      </div>
    );
  }

  return (
    <div className="chart_buttons_container">
      {buttons.map((text, index) => (
        <Button
          key={index}
          className="chart_buttons"
          style={{
            backgroundColor: index === isSelectChart && '#F1E4FF',
          }}
          onClick={() => {
            setIsSelectChart(index);
          }}
        >
          {text.icon}
          {text.label}
        </Button>
      ))}
    </div>
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
