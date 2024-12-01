import React from "react";
import ElectricSource from "../icons/ElectricSource";
import GeneratorSource from "../icons/GeneratorSource";

function IconComponent({ deviceType }) {
    console.log('Check devices type ->> ', deviceType);
    
    const DeviceTypeIconSelector = () => {
    let Component = null;
    console.log('new---------Check devices type ->> ', deviceType);
    switch (deviceType) {
        case "2":
          console.log('type ->> ', Component)
        Component = ElectricSource;
        break;
      case "1":
        Component = GeneratorSource;
        break;
      case "SOLAR":
        Component = GeneratorSource;
        break;
      case "1":
        Component = GeneratorSource;
        break;
      default:
        Component = GeneratorSource;
    }
    return Component;
  };

  // let Component = DeviceTypeIconSelector(deviceType);

  return (
      <DeviceTypeIconSelector className="power-icon__image" />
  );
}

export default IconComponent;
