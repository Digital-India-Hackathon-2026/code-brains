package com.codebrains.muleguard.repositories;

import com.codebrains.muleguard.models.CaseReport;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

/**
 * In-memory stand-in for the Postgres-backed repository. Same save()/
 * findAll() surface as the JpaRepository version, so InvestigationController
 * needs zero changes — it behaves like it's talking to a database, it
 * just isn't.
 */
@Repository
public class CaseReportRepository {

    private final List<CaseReport> store = new ArrayList<>();

    public synchronized CaseReport save(CaseReport report) {
        store.removeIf(r -> r.getInvestigationId() != null
                && r.getInvestigationId().equals(report.getInvestigationId()));
        store.add(report);
        return report;
    }

    public synchronized List<CaseReport> findAll() {
        return new ArrayList<>(store);
    }
}
