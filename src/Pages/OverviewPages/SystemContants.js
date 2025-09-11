/* eslint-disable no-restricted-globals */
import React, { useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";
import { Button, Spin } from "antd";
import { fetchSystemConstantsAll, bulkUpdateSystemConstants, updateSystemConstantById } from "../../redux/actions/systemConstants/system.constants.action";

function SystemConstants(props) {
  const { systemConstants, fetchSystemConstantsAll: fetchAll, bulkUpdateSystemConstants: bulkUpdate, updateSystemConstantById: updateOne } = props;
  const [savingBulk, setSavingBulk] = useState(false);
  const [savingDiesel, setSavingDiesel] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editedValues, setEditedValues] = useState({});
  const [editedTariff, setEditedTariff] = useState({});

  const DIESEL_CONSTANT_NAME = "DIESEL_PRICE_PER_LITRE";

  const tariffPairs = useMemo(
    () => [
      { band: "A", rate: "TARIFF_BAND_A_RATE", threshold: "TARIFF_BAND_A_THRESHOLD" },
      { band: "B", rate: "TARIFF_BAND_B_RATE", threshold: "TARIFF_BAND_B_THRESHOLD" },
      { band: "C", rate: "TARIFF_BAND_C_RATE", threshold: "TARIFF_BAND_C_THRESHOLD" },
      { band: "D", rate: "TARIFF_BAND_D_RATE", threshold: "TARIFF_BAND_D_THRESHOLD" },
      { band: "E", rate: "TARIFF_BAND_E_RATE", threshold: "TARIFF_BAND_E_THRESHOLD" },
    ],
    []
  );

  const dieselValue = useMemo(() => {
    const edited = editedValues[DIESEL_CONSTANT_NAME];
    if (edited !== undefined && edited !== null && edited !== "") return edited;
    return systemConstants.values?.[DIESEL_CONSTANT_NAME];
  }, [editedValues, systemConstants.values]);

  const getConstantMeta = (name) => {
    if (!Array.isArray(systemConstants.list)) return {};
    const found = systemConstants.list.find((c) => c?.name === name);
    return found || {};
  };

  useEffect(() => {
    setError("");
    setSuccess("");
    fetchAll();
  }, [fetchAll]);

  const onChangeConstant = (name, value) => {
    setEditedValues((prev) => ({ ...prev, [name]: value }));
  };

  const onChangeTariff = (band, key, value) => {
    setEditedTariff((prev) => ({
      ...prev,
      [band]: {
        ...(prev[band] || (systemConstants.tariff || {})[band] || {}),
        [key]: value,
      },
    }));
  };

  const validateNumber = (val) => {
    if (val === "" || val === null || val === undefined) return false;
    const num = Number(val);
    return Number.isFinite(num);
  };

  const handleSaveBulk = async () => {
    setSavingBulk(true);
    setError("");
    setSuccess("");
    try {
      const constantsPayload = [];
      Object.entries(editedValues).forEach(([name, val]) => {
        if (validateNumber(val)) {
          constantsPayload.push({ name, value: Number(val) });
        }
      });

      // Map edited tariff into constants names
      Object.entries(editedTariff).forEach(([band, data]) => {
        const pair = tariffPairs.find((p) => p.band === band);
        if (!pair) return;
        const maybeRate = data?.rate;
        const maybeThreshold = data?.threshold;
        if (validateNumber(maybeRate)) {
          constantsPayload.push({ name: pair.rate, value: Number(maybeRate) });
        }
        if (validateNumber(maybeThreshold)) {
          constantsPayload.push({ name: pair.threshold, value: Number(maybeThreshold) });
        }
      });

      if (constantsPayload.length === 0) {
        setError("No valid changes to save.");
        return;
      }

      await bulkUpdate({ constants: constantsPayload });
      setSuccess("Constants updated successfully.");
      setEditedValues({});
      setEditedTariff({});
    } catch (e) {
      setError("Failed to save changes. Please try again.");
    } finally {
      setSavingBulk(false);
    }
  };

  const handleSaveDiesel = async () => {
    setSavingDiesel(true);
    setError("");
    setSuccess("");
    try {
      if (!validateNumber(dieselValue)) {
        setError("Please enter a valid diesel price.");
        return;
      }
      const dieselItem = (systemConstants.list || []).find((c) => c?.name === DIESEL_CONSTANT_NAME);
      const dieselId = dieselItem?.id;
      await updateOne(dieselId, {
        value: Number(dieselValue),
        description: "Current Diesel Price per Litre in Naira",
        source: "Current market rate",
        is_active: true,
      });
      setSuccess("Diesel price updated successfully.");
      setEditedValues((prev) => ({ ...prev, [DIESEL_CONSTANT_NAME]: undefined }));
    } catch (e) {
      setError("Failed to update diesel price. Please try again.");
    } finally {
      setSavingDiesel(false);
    }
  };

  const renderHeader = () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <h2 style={{ margin: 0 }}>System Constants</h2>
      <div>
        <Button
          type="primary"
          onClick={handleSaveBulk}
          disabled={savingBulk || systemConstants.loading}
        >
          {savingBulk ? "Saving..." : "Save All Changes"}
        </Button>
      </div>
    </div>
  );

  const renderAlerts = () => (
    <div style={{ marginBottom: 12 }}>
      {error ? (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 8 }}>{error}</div>
      ) : null}
      {success ? (
        <div style={{ background: "#ecfdf5", color: "#065f46", padding: 12, borderRadius: 8 }}>{success}</div>
      ) : null}
    </div>
  );

  const renderDieselCard = () => (
    <div style={{
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 16,
      background: "#fff",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Diesel Price per Litre</h3>
        <button
          type="button"
          onClick={handleSaveDiesel}
          disabled={savingDiesel || systemConstants.loading}
          style={{
            padding: "8px 12px",
            background: "#111827",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: savingDiesel || systemConstants.loading ? "not-allowed" : "pointer",
          }}
        >
          {savingDiesel ? "Updating..." : "Update"}
        </button>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <label htmlFor="dieselPrice" style={{ minWidth: 180 }}>Price (NGN/Litre)</label>
        <input
          id="dieselPrice"
          type="number"
          step="0.01"
          value={dieselValue ?? ""}
          onChange={(e) => onChangeConstant(DIESEL_CONSTANT_NAME, e.target.value)}
          placeholder="e.g. 1100"
          style={{
            flex: 1,
            padding: "10px 12px",
            border: "1px solid #d1d5db",
            borderRadius: 8,
          }}
        />
      </div>
      {(() => {
        const meta = getConstantMeta(DIESEL_CONSTANT_NAME);
        return (
          <div style={{ marginTop: 8, color: "#6b7280", fontSize: 12 }}>
            {meta?.description ? <div>{meta.description}</div> : null}
            {meta?.source ? (
              <div>
                Source: <b>{meta.source}</b>
              </div>
            ) : null}
          </div>
        );
      })()}
    </div>
  );

  const renderTariffCard = () => (
    <div style={{
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 16,
      background: "#fff",
    }}>
      <h3 style={{ marginTop: 0 }}>Utility Tariff Structure</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 10 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #e5e7eb" }}>Band</th>
              <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #e5e7eb" }}>Threshold (Hours)</th>
              <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #e5e7eb" }}>Rate (NGN/kWh)</th>
            </tr>
          </thead>
          <tbody>
            {tariffPairs.map(({ band }) => {
              const base = systemConstants.tariff?.[band] || {};
              const edited = editedTariff[band] || {};
              const threshold = edited.threshold ?? base.threshold ?? "";
              const rate = edited.rate ?? base.rate ?? "";
              return (
                <tr key={band}>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}>{band}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}>
                    <input
                      type="number"
                      step="1"
                      value={threshold}
                      onChange={(e) => onChangeTariff(band, "threshold", e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 8 }}
                    />
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}>
                    <input
                      type="number"
                      step="0.01"
                      value={rate}
                      onChange={(e) => onChangeTariff(band, "rate", e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 8 }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOtherConstants = () => {
    const exclude = new Set([
      DIESEL_CONSTANT_NAME,
      ...tariffPairs.flatMap((p) => [p.rate, p.threshold]),
    ]);
    const entries = Object.entries(systemConstants.values || {}).filter(([name]) => !exclude.has(name));
    if (entries.length === 0) return null;
    return (
      <div style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        background: "#fff",
      }}>
        <h3 style={{ marginTop: 0 }}>Other Constants</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 12 }}>
          {entries.map(([name, value]) => {
            const edited = editedValues[name];
            const shown = edited ?? value ?? "";
            const meta = getConstantMeta(name);
            return (
              <div key={name} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>{name}</label>
                <input
                  type="number"
                  step="0.000001"
                  value={shown}
                  onChange={(e) => onChangeConstant(name, e.target.value)}
                  style={{ padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, height: "30px" }}
                />
                {(meta?.description || meta?.source) ? (
                  <div style={{ color: "#6b7280", fontSize: 12 }}>
                    {meta?.description ? <div>{meta.description}</div> : null}
                    {meta?.source ? (
                      <div>
                        Source: <a href={meta.source} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>{meta.source}</a>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (systemConstants.loading) {
    return (
      <div style={{ padding: "24px 32px" }}>
        {renderHeader()}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <Spin size="large" tip="Loading system constants..." />
        </div>
      </div>
    );
  }
 
  return (
    <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
      {renderHeader()}
      {renderAlerts()}
      {renderDieselCard()}
      {renderTariffCard()}
      {renderOtherConstants()}
  </div>
  );
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  systemConstants: state.systemConstants,
});

const mapDispatchToProps = {
  fetchSystemConstantsAll,
  bulkUpdateSystemConstants,
  updateSystemConstantById,
};

export default connect(mapStateToProps, mapDispatchToProps)(SystemConstants);