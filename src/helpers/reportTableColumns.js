

export const utilityConsumptnColumn = [
    {
      title: "Device",
      dataIndex: "name",
      key: "name",
      ellipsis: true
    },
    {
      title: "Energy(kWh)",
      dataIndex: "value",
      key: "value",
      ellipsis: true,
      render: (value) => (
        <>
          {value.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })
          }
        </>
      ),
    },
    {
      title: "Time of use",
      dataIndex: "time_of_use",
      key: "time_of_use",
      ellipsis: true,
      render: (value) => (
        <>
          {value.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })
          }
        </>
      ),
    },
    {
      title: "Expected Bill",
      dataIndex: "expected_bill",
      key: "expected_bill",
      ellipsis: true,
      render: (value) => (
        <>
          {value.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })
          }
        </>
      ),
    },
    {
      title: "Last Bill Accuracy(%)",
      dataIndex: "last_bill_accuracy",
      key: "last_bill_accuracy",
      ellipsis: true,
      render: (value) => (
        <>
          {value.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })
          }
        </>
      ),
    },
  ]


  export const solarHourConsumptnColumn = [
    {
      title: "Energy consumed during solar hours (kWh)",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Time of use",
      dataIndex: "value",
      key: "value",
      ellipsis: true,
      render: (value) => (
        <>
          {value
            ? value.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })
            : 0}
        </>
      ),
    },
  ]
  export const bandCategorizationColumn = [
    {
      title: "Band",
      dataIndex: "band",
      ellipsis: true,
    },
    {
      title: "Total Hours(achieved)",
      dataIndex: "total_hours",
      ellipsis: true,
    },
    {
      title: "Expected Hours",
      dataIndex: "expected_hours",
      ellipsis: true,
    },
    {
      title: "Deviation (+or_)",
      dataIndex: "_",
      ellipsis: true,
      render: (_,values) => (
        <>
          {
            (values.total_hours-values.expected_hours) + (' hours')
          }
        </>
      ),
    },
    {
      title: "Percentage Compliance",
      dataIndex: "_",
      ellipsis: true,
      render: (_,values) => (
        <>
          {
            ((values.total_hours/values.expected_hours) * 100).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })
          }
        </>
      ),
    },
  ]
  export const deviationUsageBreakdownColumn = [
    {
      title: "Category",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Total Hours(achieved)",
      dataIndex: "value",
      key: "value",
      ellipsis: true,
      render: (_, values) => (
        <>
          {values
            ? values.value.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            }) + values.unit
            : 0}
        </>
      ),
    },
    {
      title: "Percentage",
      dataIndex: "value",
      key: "value",
      ellipsis: true,
      render: (_, values) => (
        <>
          {values
            ? values.value.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            }) + values.unit
            : 0}
        </>
      ),
    },
  ]

  export const deviationUtitlityAndDieselColumn = [
    {
      title: "Category",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      ellipsis: true,
      render: (_, values) => (
        <>
          {values
            ? values.value.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            }) + values.deviationUnit
            : 0}
        </>
      ),
    },
    {
      title: "Deviation",
      dataIndex: "deviation",
      ellipsis: true,
      render: (_, values) => (
        <>
          {values
            ? values.value.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            }) + values.deviationUnit
            : 0}
        </>
      ),
    },
  ]
  export const fuelEfficiencyAccuracyComparisonColumn = [
    {
      title: "Category",
      dataIndex: "key",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      ellipsis: true,
    },
  ]
