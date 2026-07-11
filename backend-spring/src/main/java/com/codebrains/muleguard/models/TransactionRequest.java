package com.codebrains.muleguard.models;

/**
 * Mirrors the transaction shape the muletrace-ai frontend sends to
 * POST /api/v1/ml/predict (see SecureInterfacesPage.jsx / SandboxView.jsx).
 */
public class TransactionRequest {

    private String id;
    private String sourceAccount;
    private String sourceHolder;
    private String sourceBank;
    private String destAccount;
    private String destHolder;
    private String destBank;
    private double amount;
    private String timestamp;
    private String method;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSourceAccount() { return sourceAccount; }
    public void setSourceAccount(String sourceAccount) { this.sourceAccount = sourceAccount; }

    public String getSourceHolder() { return sourceHolder; }
    public void setSourceHolder(String sourceHolder) { this.sourceHolder = sourceHolder; }

    public String getSourceBank() { return sourceBank; }
    public void setSourceBank(String sourceBank) { this.sourceBank = sourceBank; }

    public String getDestAccount() { return destAccount; }
    public void setDestAccount(String destAccount) { this.destAccount = destAccount; }

    public String getDestHolder() { return destHolder; }
    public void setDestHolder(String destHolder) { this.destHolder = destHolder; }

    public String getDestBank() { return destBank; }
    public void setDestBank(String destBank) { this.destBank = destBank; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
}
