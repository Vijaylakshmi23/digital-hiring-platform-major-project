
package com.digitalhiring.repository;

import com.digitalhiring.entity.DirectHireRequest;
import com.digitalhiring.entity.DirectHireStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DirectHireRequestRepository
        extends JpaRepository<DirectHireRequest, Long> {

    List<DirectHireRequest> findByWorker_Id(Long workerId);

    List<DirectHireRequest> findByEmployer_Id(Long employerId);

    boolean existsByEmployer_IdAndWorker_IdAndStatus(
            Long employerId,
            Long workerId,
            DirectHireStatus status
    );
}
