import InvestorRoute from "../../routes/InvestorRoute";

function InvestorPageView({ basePath = "" }) {
  return (
    <div className="PageContent investor-shell">
      <InvestorRoute basePath={basePath} />
    </div>
  );
}

export default InvestorPageView;
