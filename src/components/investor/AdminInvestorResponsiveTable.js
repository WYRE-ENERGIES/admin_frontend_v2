import { Table } from "antd";
import AdminInvestorMobileTableList from "./AdminInvestorMobileTableList";
import InvestorResponsiveDataView from "./InvestorResponsiveDataView";

function AdminInvestorResponsiveTable({
  mobileTitleKey,
  mobileSubtitleKey,
  emptyText,
  onRow,
  ...tableProps
}) {
  const { columns, dataSource, loading, rowKey, pagination } = tableProps;

  const handleRowClick = onRow
    ? (record) => {
        const props = onRow(record);
        props?.onClick?.();
      }
    : undefined;

  return (
    <InvestorResponsiveDataView
      desktop={<Table {...tableProps} onRow={onRow} />}
      mobile={
        <AdminInvestorMobileTableList
          columns={columns}
          dataSource={dataSource || []}
          loading={loading}
          rowKey={rowKey}
          pagination={pagination}
          mobileTitleKey={mobileTitleKey}
          mobileSubtitleKey={mobileSubtitleKey}
          emptyText={emptyText}
          onRowClick={handleRowClick}
        />
      }
    />
  );
}

export default AdminInvestorResponsiveTable;
