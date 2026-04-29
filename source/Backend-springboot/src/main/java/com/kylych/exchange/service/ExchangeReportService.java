package com.kylych.exchange.service;

import com.kylych.exchange.domain.ExchangeReportStatus;
import com.kylych.exchange.dto.ExchangeReportDTO;
import com.kylych.exchange.dto.ExchangeReportRequest;
import com.kylych.exchange.model.ExchangeBorrowRecord;
import com.kylych.exchange.model.ExchangeReport;
import com.kylych.exchange.repository.ExchangeBorrowRecordRepository;
import com.kylych.exchange.repository.ExchangeReportRepository;
import com.kylych.modal.User;
import com.kylych.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExchangeReportService {

    private final ExchangeReportRepository reportRepository;
    private final ExchangeBorrowRecordRepository borrowRepository;
    private final UserRepository userRepository;
    private final ExchangeReputationService reputationService;

    @Transactional
    public ExchangeReportDTO createReport(User reporter, ExchangeReportRequest req) {
        ExchangeBorrowRecord borrowRecord = borrowRepository.findById(req.getBorrowRecordId())
                .orElseThrow(() -> new IllegalArgumentException("Borrow record not found"));
        User reportedUser = userRepository.findById(req.getReportedUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ExchangeReport report = ExchangeReport.builder()
                .reporter(reporter)
                .reportedUser(reportedUser)
                .borrowRecord(borrowRecord)
                .reason(req.getReason())
                .description(req.getDescription())
                .status(ExchangeReportStatus.PENDING)
                .build();
        return toDTO(reportRepository.save(report));
    }

    public List<ExchangeReportDTO> getMyReports(User reporter) {
        return reportRepository.findByReporter(reporter).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    // Admin
    public Page<ExchangeReportDTO> getAllReports(ExchangeReportStatus status, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (status != null) return reportRepository.findByStatus(status, pageable).map(this::toDTO);
        return reportRepository.findAll(pageable).map(this::toDTO);
    }

    @Transactional
    public ExchangeReportDTO resolveReport(Long reportId, ExchangeReportStatus newStatus,
                                           String adminNotes, boolean penalizeReported) {
        ExchangeReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found: " + reportId));
        report.setStatus(newStatus);
        report.setAdminNotes(adminNotes);
        if (penalizeReported) {
            reputationService.applyPenalty(report.getReportedUser(), 3);
        }
        return toDTO(reportRepository.save(report));
    }

    public ExchangeReportDTO toDTO(ExchangeReport r) {
        return ExchangeReportDTO.builder()
                .id(r.getId())
                .reporterId(r.getReporter().getId())
                .reporterName(r.getReporter().getFullName())
                .reportedUserId(r.getReportedUser().getId())
                .reportedUserName(r.getReportedUser().getFullName())
                .borrowRecordId(r.getBorrowRecord() != null ? r.getBorrowRecord().getId() : null)
                .reason(r.getReason())
                .description(r.getDescription())
                .status(r.getStatus())
                .adminNotes(r.getAdminNotes())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
