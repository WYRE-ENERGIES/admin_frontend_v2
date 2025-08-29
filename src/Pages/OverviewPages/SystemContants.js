/* eslint-disable no-restricted-globals */
import React from "react";
import {
  getDownloadAllDevices,
  getDownloadDeviceConsumption,
  getDownloadDeviceReadings,
  toggleNonPostingDevice,
} from "../../redux/actions/auth/auth.action";
import { connect } from "react-redux";

function SystemConstants(props) {
 
  return (
    <div>
      System Constants
  </div>
  );
}

const mapDispatchToProps = {
  getDownloadAllDevices,
  getDownloadDeviceReadings,
  getDownloadDeviceConsumption,
  toggleNonPostingDevice,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(SystemConstants);

// end of script
