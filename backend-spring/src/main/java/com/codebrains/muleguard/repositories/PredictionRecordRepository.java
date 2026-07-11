package com.codebrains.muleguard.repositories;

import com.codebrains.muleguard.models.PredictionRecord;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * In-memory stand-in for the Postgres-backed repository. Method names and
 * signatures are kept identical to the JpaRepository version, so
 * MlController and everything else that calls this needs zero changes —
 * it behaves like it's talking to a database, it just isn't.
 */
@Repository
public class PredictionRecordRepository {

    private final List<PredictionRecord> store = new ArrayList<>();
    private final AtomicLong idSequence = new AtomicLong(1);

    public synchronized PredictionRecord save(PredictionRecord record) {
        if (record.getId() == null) {
            record.setId(idSequence.getAndIncrement());
        }
        store.removeIf(r -> r.getId().equals(record.getId()));
        store.add(record);
        return record;
    }

    public synchronized List<PredictionRecord> findAll() {
        return new ArrayList<>(store);
    }

    public synchronized List<PredictionRecord> findByRiskLevel(String riskLevel) {
        return store.stream()
                .filter(r -> riskLevel.equalsIgnoreCase(r.getRiskLevel()))
                .collect(Collectors.toList());
    }

    public synchronized List<PredictionRecord> findTop50ByOrderByCreatedAtDesc() {
        return store.stream()
                .sorted(Comparator.comparing(PredictionRecord::getCreatedAt).reversed())
                .limit(50)
                .collect(Collectors.toList());
    }
}
