import React from "react";
import ElectricSource from "../icons/ElectricSource";
import GeneratorSource from "../icons/GeneratorSource";

function IconComponent({ deviceType, className }) {

  const DeviceTypeIconSelector = () => {
    let Component = null;
    switch (deviceType) {
      case 2:
        // electric source
        Component = ElectricSource;
        break;
      case 1:
        // generator source
        Component = GeneratorSource;
        break;
      case 3:
        // solar source the source component should be changed to solar
        Component = GeneratorSource;
        break;
      default:
        Component = GeneratorSource;
    }

    return <Component className={className} />;
  };

  // let Component = DeviceTypeIconSelector(deviceType);

  return (
    <DeviceTypeIconSelector className="power-icon__image" />
  );
}

export default IconComponent;
