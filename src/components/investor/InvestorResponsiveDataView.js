function InvestorResponsiveDataView({ desktop, mobile }) {
  return (
    <>
      <div className="investor-data-view investor-data-view--desktop">{desktop}</div>
      <div className="investor-data-view investor-data-view--mobile">{mobile}</div>
    </>
  );
}

export default InvestorResponsiveDataView;
