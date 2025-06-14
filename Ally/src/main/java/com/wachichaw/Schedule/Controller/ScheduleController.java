package com.wachichaw.Schedule.Controller;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors; // Added for mapping to DTO

import com.wachichaw.Schedule.DTO.ScheduleResponseDTO; // Added DTO import
import com.wachichaw.Schedule.DTO.UserSummaryDTO; // Added DTO import
import com.wachichaw.Schedule.DTO.CaseSummaryDTO; // Added for case appointments
import com.wachichaw.Schedule.DTO.BookingRequestDTO;
import com.wachichaw.Schedule.DTO.CaseBookingRequestDTO;
import com.wachichaw.Schedule.DTO.RescheduleRequestDTO;
import com.wachichaw.Schedule.DTO.AvailableSlotResponseDTO;
import com.wachichaw.Schedule.DTO.AcceptRequestDTO;
import com.wachichaw.Schedule.DTO.DeclineRequestDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.wachichaw.Schedule.Entity.ScheduleEntity;
import com.wachichaw.Schedule.Service.ScheduleService;
import com.wachichaw.Lawyer.Entity.LawyerEntity;
import com.wachichaw.Client.Entity.ClientEntity;
import com.wachichaw.Client.Repo.ClientRepo;
import com.wachichaw.User.Repo.UserRepo;

@RestController
@RequestMapping("/schedules")
public class ScheduleController {    @Autowired
    private final ScheduleService scheduleService;
    @Autowired
    private ClientRepo clientRepo;
    @Autowired
    private UserRepo userRepo;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    /**
     * Create a new appointment booking
     * POST /schedules/book
     */    @PostMapping("/book")
    public ResponseEntity<?> createAppointment(@RequestBody BookingRequestDTO request) {
        try {
            LocalDateTime startTime = parseDateTime(request.getStartTime());            ScheduleEntity schedule = scheduleService.createAppointment(
                request.getClientId(),
                request.getLawyerId(),
                startTime
            );

            ScheduleResponseDTO scheduleResponseDTO = convertToScheduleResponseDTO(schedule);

            return ResponseEntity.ok(scheduleResponseDTO);
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body("Invalid date format. Use yyyy-MM-dd'T'HH:mm:ss");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create appointment");
        }
    }

    /**
     * Create a new appointment booking for a specific legal case
     * POST /schedules/book-for-case
     */    @PostMapping("/book-for-case")
    public ResponseEntity<?> createCaseAppointment(@RequestBody CaseBookingRequestDTO request) {
        try {
            LocalDateTime startTime = parseDateTime(request.getStartTime());            ScheduleEntity schedule = scheduleService.createCaseAppointment(
                request.getClientId(),
                request.getCaseId(),
                startTime
            );

            ScheduleResponseDTO scheduleResponseDTO = convertToScheduleResponseDTO(schedule);

            return ResponseEntity.ok(scheduleResponseDTO);
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body("Invalid date format. Use yyyy-MM-dd'T'HH:mm:ss");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create case appointment");
        }
    }

    /**
     * Get all schedules for a specific lawyer
     * GET /schedules/lawyer/{lawyerId}
     */
    @GetMapping("/lawyer/{lawyerId}")
    public ResponseEntity<?> getLawyerSchedules(@PathVariable int lawyerId) {
        try {
            LawyerEntity lawyer = (LawyerEntity) userRepo.findById(lawyerId)
                .orElseThrow(() -> new RuntimeException("Lawyer not found with ID: " + lawyerId));

            List<ScheduleEntity> schedules = scheduleService.getSchedulesForLawyer(lawyer);
            List<ScheduleResponseDTO> scheduleResponseDTOs = schedules.stream()
                .map(this::convertToScheduleResponseDTO)
                .collect(Collectors.toList());
            return ResponseEntity.ok(scheduleResponseDTOs);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to retrieve lawyer schedules");
        }
    }

    /**
     * Get all schedules for a specific client
     * GET /schedules/client/{clientId}
     */
    @GetMapping("/client/{clientId}")
    public ResponseEntity<?> getClientSchedules(@PathVariable int clientId) {
        try {
            ClientEntity client = clientRepo.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with ID: " + clientId));

            List<ScheduleEntity> schedules = scheduleService.getSchedulesForClient(client);
            List<ScheduleResponseDTO> scheduleResponseDTOs = schedules.stream()
                .map(this::convertToScheduleResponseDTO)
                .collect(Collectors.toList());
            return ResponseEntity.ok(scheduleResponseDTOs);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to retrieve client schedules");
        }
    }

    /**
     * Get upcoming schedules for a lawyer (dashboard)
     * GET /schedules/lawyer/{lawyerId}/upcoming
     */
    @GetMapping("/lawyer/{lawyerId}/upcoming")
    public ResponseEntity<?> getUpcomingLawyerSchedules(@PathVariable int lawyerId) {
        try {
            LawyerEntity lawyer = (LawyerEntity) userRepo.findById(lawyerId)
                .orElseThrow(() -> new RuntimeException("Lawyer not found with ID: " + lawyerId));

            List<ScheduleEntity> schedules = scheduleService.getUpcomingSchedulesForLawyer(lawyer);
            List<ScheduleResponseDTO> scheduleResponseDTOs = schedules.stream()
                .map(this::convertToScheduleResponseDTO)
                .collect(Collectors.toList());
            return ResponseEntity.ok(scheduleResponseDTOs);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to retrieve upcoming schedules");
        }
    }

    /**
     * Get upcoming schedules for a client
     * GET /schedules/client/{clientId}/upcoming
     */
    @GetMapping("/client/{clientId}/upcoming")
    public ResponseEntity<?> getUpcomingClientSchedules(@PathVariable int clientId) {
        try {
            ClientEntity client = clientRepo.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with ID: " + clientId));

            List<ScheduleEntity> schedules = scheduleService.getUpcomingSchedulesForClient(client);
            List<ScheduleResponseDTO> scheduleResponseDTOs = schedules.stream()
                .map(this::convertToScheduleResponseDTO)
                .collect(Collectors.toList());
            return ResponseEntity.ok(scheduleResponseDTOs);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to retrieve upcoming schedules");
        }
    }

    /**
     * Get lawyer's schedule within a date range
     * GET /schedules/lawyer/{lawyerId}/range?start=...&end=...
     */
    @GetMapping("/lawyer/{lawyerId}/range")
    public ResponseEntity<?> getLawyerScheduleInRange(
            @PathVariable int lawyerId,
            @RequestParam String start,
            @RequestParam String end) {
        try {
            LawyerEntity lawyer = (LawyerEntity) userRepo.findById(lawyerId)
                .orElseThrow(() -> new RuntimeException("Lawyer not found with ID: " + lawyerId));

            LocalDateTime startDate = parseDateTime(start);
            LocalDateTime endDate = parseDateTime(end);

            List<ScheduleEntity> schedules = scheduleService.getLawyerScheduleInRange(lawyer, startDate, endDate);
            List<ScheduleResponseDTO> scheduleResponseDTOs = schedules.stream()
                .map(this::convertToScheduleResponseDTO)
                .collect(Collectors.toList());
            return ResponseEntity.ok(scheduleResponseDTOs);
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body("Invalid date format. Use yyyy-MM-dd'T'HH:mm:ss");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to retrieve schedule range");
        }
    }

    /**
     * Get all available time slots for a lawyer on a specific date
     * Optimized endpoint that replaces multiple individual availability checks
     * GET /schedules/lawyer/{lawyerId}/available-slots?date=2025-01-15
     */
    @GetMapping("/lawyer/{lawyerId}/available-slots")
    public ResponseEntity<?> getAvailableSlots(
            @PathVariable int lawyerId,
            @RequestParam String date) {
        try {
            LocalDate requestDate = LocalDate.parse(date);
            
            // Validate date is not in the past
            if (requestDate.isBefore(LocalDate.now())) {
                return ResponseEntity.badRequest().body("Cannot check availability for past dates");
            }
            
            // Validate date is not a weekend
            if (requestDate.getDayOfWeek() == DayOfWeek.SATURDAY ||
                requestDate.getDayOfWeek() == DayOfWeek.SUNDAY) {
                return ResponseEntity.badRequest().body("No consultations available on weekends");
            }
            
            AvailableSlotResponseDTO response = scheduleService.getAvailableSlots(lawyerId, requestDate);
            return ResponseEntity.ok(response);
            
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body("Invalid date format. Use YYYY-MM-DD");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve available slots");
        }
    }

    /**
     * Cancel an appointment
     * PUT /schedules/{scheduleId}/cancel
     */
    @PutMapping("/{scheduleId}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Integer scheduleId) {
        try {
            ScheduleEntity schedule = scheduleService.cancelAppointment(scheduleId);
            ScheduleResponseDTO scheduleResponseDTO = convertToScheduleResponseDTO(schedule);
            return ResponseEntity.ok(scheduleResponseDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to cancel appointment");
        }
    }


    /**
     * Accept an appointment (for lawyers)
     * PUT /schedules/{scheduleId}/accept
     */
    @PutMapping("/{scheduleId}/accept")
    public ResponseEntity<?> acceptAppointment(
            @PathVariable Integer scheduleId,
            @RequestBody AcceptRequestDTO request) {
        try {
            ScheduleEntity schedule = scheduleService.acceptAppointment(scheduleId, request.getLawyerId());
            ScheduleResponseDTO scheduleResponseDTO = convertToScheduleResponseDTO(schedule);
            return ResponseEntity.ok(scheduleResponseDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to accept appointment");
        }
    }

    /**
     * Decline an appointment (for lawyers)
     * PUT /schedules/{scheduleId}/decline
     */
    @PutMapping("/{scheduleId}/decline")
    public ResponseEntity<?> declineAppointment(
            @PathVariable Integer scheduleId,
            @RequestBody DeclineRequestDTO request) {
        try {
            ScheduleEntity schedule = scheduleService.declineAppointment(scheduleId, request.getLawyerId(), request.getReason());
            ScheduleResponseDTO scheduleResponseDTO = convertToScheduleResponseDTO(schedule);
            return ResponseEntity.ok(scheduleResponseDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to decline appointment");
        }
    }

    /**
     * Get a specific schedule by ID
     * GET /schedules/{scheduleId}
     */
    @GetMapping("/{scheduleId}")
    public ResponseEntity<?> getScheduleById(@PathVariable Integer scheduleId) {
        try {
            Optional<ScheduleEntity> scheduleOptional = scheduleService.findScheduleById(scheduleId);
            if (scheduleOptional.isPresent()) {
                ScheduleEntity schedule = scheduleOptional.get();
                return ResponseEntity.ok(convertToScheduleResponseDTO(schedule)); // Return DTO
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to retrieve schedule");
        }
    }

    /**
     * Get all schedules (admin function)
     * GET /schedules/admin/all
     */
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllSchedules() {
        try {
            List<ScheduleEntity> schedules = scheduleService.getAllSchedules();
            List<ScheduleResponseDTO> scheduleResponseDTOs = schedules.stream()
                .map(this::convertToScheduleResponseDTO)
                .collect(Collectors.toList());
            return ResponseEntity.ok(scheduleResponseDTOs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to retrieve all schedules");
        }
    }

    /**
     * Helper method to parse datetime strings
     */
    private LocalDateTime parseDateTime(String dateTimeStr) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
        return LocalDateTime.parse(dateTimeStr, formatter);
    }    // Helper method to convert ScheduleEntity to ScheduleResponseDTO
    private ScheduleResponseDTO convertToScheduleResponseDTO(ScheduleEntity schedule) {
        UserSummaryDTO clientDTO = new UserSummaryDTO(
            schedule.getClient().getUserId(),
            schedule.getClient().getFname(),
            schedule.getClient().getLname(),
            schedule.getClient().getEmail(),
            schedule.getClient().getPhoneNumber()
        );
        UserSummaryDTO lawyerDTO = new UserSummaryDTO(
            schedule.getLawyer().getUserId(),
            schedule.getLawyer().getFname(),
            schedule.getLawyer().getLname(),
            schedule.getLawyer().getEmail(),
            schedule.getLawyer().getPhoneNumber()
        );
          // Check if this is a case-based appointment
        CaseSummaryDTO caseDTO = null;
        if (schedule.getLegalCase() != null) {
            caseDTO = new CaseSummaryDTO(
                schedule.getLegalCase().getCaseId(),
                schedule.getLegalCase().getTitle(),
                schedule.getLegalCase().getStatus().toString(),
                schedule.getLegalCase().getDescription()
            );
        }
          return new ScheduleResponseDTO(
            schedule.getScheduleId(),
            lawyerDTO,
            clientDTO,
            schedule.getBookingStartTime(),
            schedule.getBookingEndTime(),
            schedule.isBooked(),
            caseDTO,
            schedule.getStatus(),
            schedule.getDeclineReason()
        );
    }
}
