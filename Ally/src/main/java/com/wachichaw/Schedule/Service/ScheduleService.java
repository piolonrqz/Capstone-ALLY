package com.wachichaw.Schedule.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wachichaw.Schedule.Entity.ScheduleEntity;
import com.wachichaw.Schedule.Entity.AppointmentStatus;
import com.wachichaw.Schedule.Repo.ScheduleRepository;
import com.wachichaw.Schedule.DTO.AvailableSlotResponseDTO;
import com.wachichaw.Schedule.DTO.TimeSlotDTO;
import com.wachichaw.Lawyer.Entity.LawyerEntity;
import com.wachichaw.Lawyer.Repo.LawyerRepo;
import com.wachichaw.Client.Entity.ClientEntity;
import com.wachichaw.Client.Repo.ClientRepo;
import com.wachichaw.Case.Entity.LegalCasesEntity;
import com.wachichaw.Case.Entity.CaseStatus;
import com.wachichaw.Case.Repo.LegalCaseRepo;

@Service
public class ScheduleService {

    @Autowired
    private final ScheduleRepository scheduleRepository;
    @Autowired
    private ClientRepo clientRepo;
    @Autowired
    private LawyerRepo lawyerRepo;
    @Autowired
    private LegalCaseRepo legalCaseRepo;
    @Autowired
    private ReminderService reminderService;

    public ScheduleService(ScheduleRepository scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }    /**
     * Create a new appointment booking
     */
    public ScheduleEntity createAppointment(int clientId, int lawyerId, LocalDateTime startTime) {
        // Validate client exists
        ClientEntity client = clientRepo.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with ID: " + clientId));
        
        // Validate lawyer exists
        LawyerEntity lawyer = lawyerRepo.findById(lawyerId)
                .orElseThrow(() -> new RuntimeException("Lawyer not found with ID: " + lawyerId));

        // Validate booking time (must be in the future)
        if (startTime.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot book appointments in the past");
        }

        // Calculate end time (1-hour consultation)
        LocalDateTime endTime = startTime.plusHours(1);

        // Check for scheduling conflicts
        if (hasSchedulingConflict(lawyer, startTime, endTime)) {
            throw new RuntimeException("Lawyer is not available at the requested time slot");
        }        // Create and save the schedule
        ScheduleEntity schedule = new ScheduleEntity();
        schedule.setClient(client);
        schedule.setLawyer(lawyer);
        schedule.setBookingStartTime(startTime);
        schedule.setBookingEndTime(endTime);
        schedule.setBooked(true); // Set is_booked to true for new appointments

        return scheduleRepository.save(schedule);
    }

    /**
     * Create a new appointment booking for a specific legal case
     */
    public ScheduleEntity createCaseAppointment(int clientId, int caseId, LocalDateTime startTime) {        // Validate case exists and is ACCEPTED
        LegalCasesEntity legalCase = legalCaseRepo.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Legal case not found with ID: " + caseId));
        
        if (!legalCase.getStatus().equals(CaseStatus.ACCEPTED)) {
            throw new RuntimeException("Cannot book appointment for case with status: " + legalCase.getStatus() + ". Only ACCEPTED cases allow appointments.");
        }

        // Validate client exists and owns the case
        ClientEntity client = clientRepo.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with ID: " + clientId));
        
        if (legalCase.getClient().getUserId() != client.getUserId()) {
            throw new RuntimeException("Client does not own this legal case");
        }

        // Get the assigned lawyer from the case
        LawyerEntity lawyer = legalCase.getLawyer();
        if (lawyer == null) {
            throw new RuntimeException("No lawyer assigned to this case");
        }

        // Validate booking time (must be in the future)
        if (startTime.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot book appointments in the past");
        }

        // Calculate end time (1-hour consultation)
        LocalDateTime endTime = startTime.plusHours(1);

        // Check for scheduling conflicts
        if (hasSchedulingConflict(lawyer, startTime, endTime)) {
            throw new RuntimeException("Lawyer is not available at the requested time slot");
        }

        // Create and save the schedule with case reference
        ScheduleEntity schedule = new ScheduleEntity();
        schedule.setClient(client);
        schedule.setLawyer(lawyer);
        schedule.setLegalCase(legalCase);
        schedule.setBookingStartTime(startTime);
        schedule.setBookingEndTime(endTime);
        schedule.setBooked(true);

        return scheduleRepository.save(schedule);
    }

    /**
     * Get all schedules for a specific lawyer
     */
    public List<ScheduleEntity> getSchedulesForLawyer(LawyerEntity lawyer) {
        return scheduleRepository.findByLawyer(lawyer);
    }

    /**
     * Get all schedules for a specific client
     */
    public List<ScheduleEntity> getSchedulesForClient(ClientEntity client) {
        return scheduleRepository.findByClient(client);
    }

    /**
     * Get upcoming schedules for a lawyer (for dashboard)
     */
    public List<ScheduleEntity> getUpcomingSchedulesForLawyer(LawyerEntity lawyer) {
        return scheduleRepository.findByLawyerAndBookingStartTimeAfterOrderByBookingStartTime(lawyer, LocalDateTime.now());
    }

    /**
     * Get upcoming schedules for a client
     */
    public List<ScheduleEntity> getUpcomingSchedulesForClient(ClientEntity client) {
        return scheduleRepository.findByClientAndBookingStartTimeAfterOrderByBookingStartTime(client, LocalDateTime.now());
    }

    /**
     * Get lawyer's schedule for a specific date range
     */
    public List<ScheduleEntity> getLawyerScheduleInRange(LawyerEntity lawyer, LocalDateTime startDate, LocalDateTime endDate) {
        return scheduleRepository.findByLawyerAndBookingStartTimeBetween(lawyer, startDate, endDate);
    }

    /**
     * Check if a lawyer has any scheduling conflicts for the given time slot
     */
    public boolean hasSchedulingConflict(LawyerEntity lawyer, LocalDateTime startTime, LocalDateTime endTime) {
        List<ScheduleEntity> conflicts = scheduleRepository.findConflictingSchedules(lawyer, startTime, endTime);
        return !conflicts.isEmpty();
    }

    /**
     * Get all available time slots for a lawyer on a specific date
     * This replaces multiple individual availability checks with a single operation
     * Optimized version that reduces database queries from 9 to 1
     */
    public AvailableSlotResponseDTO getAvailableSlots(int lawyerId, LocalDate date) {
        // Validate lawyer exists
        LawyerEntity lawyer = lawyerRepo.findById(lawyerId)
                .orElseThrow(() -> new RuntimeException("Lawyer not found with ID: " + lawyerId));
        
        // Define standard business hours (9 AM to 5 PM, 1-hour slots)
        List<String> standardTimeSlots = Arrays.asList(
            "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
            "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
        );
        
        // Get start and end of the day
        LocalDateTime dayStart = date.atTime(9, 0);  // 9 AM
        LocalDateTime dayEnd = date.atTime(18, 0);   // 6 PM
        
        // Single database query for all conflicting schedules for the entire day
        List<ScheduleEntity> existingSchedules = scheduleRepository
                .findByLawyerAndBookingStartTimeBetween(lawyer, dayStart, dayEnd);
        
        // Calculate available and booked slots
        List<TimeSlotDTO> availableSlots = new ArrayList<>();
        List<TimeSlotDTO> bookedSlots = new ArrayList<>();
        
        for (String timeSlot : standardTimeSlots) {
            LocalDateTime slotStart = parseTimeSlot(date, timeSlot);
            LocalDateTime slotEnd = slotStart.plusHours(1);
            
            // Check if this time slot conflicts with any existing schedule
            boolean isAvailable = existingSchedules.stream()
                    .noneMatch(schedule ->
                        schedule.getBookingStartTime().isBefore(slotEnd) &&
                        schedule.getBookingEndTime().isAfter(slotStart)
                    );
            
            String nextTimeSlot = getNextHour(timeSlot);
            TimeSlotDTO slot = new TimeSlotDTO(timeSlot, nextTimeSlot, isAvailable);
            
            if (isAvailable) {
                availableSlots.add(slot);
            } else {
                slot.setUnavailableReason("Booked");
                bookedSlots.add(slot);
            }
        }
        
        return new AvailableSlotResponseDTO(date.toString(), availableSlots, bookedSlots, "9:00 AM - 6:00 PM");
    }

    /**
     * Helper method to parse time slot string to LocalDateTime
     */
    private LocalDateTime parseTimeSlot(LocalDate date, String timeSlot) {
        // Parse time slot like "09:00 AM" to LocalDateTime
        String[] parts = timeSlot.split(" ");
        String timePart = parts[0];
        String amPm = parts[1];
        
        String[] hourMin = timePart.split(":");
        int hour = Integer.parseInt(hourMin[0]);
        int minute = Integer.parseInt(hourMin[1]);
        
        // Convert to 24-hour format
        if (amPm.equals("PM") && hour != 12) {
            hour += 12;
        } else if (amPm.equals("AM") && hour == 12) {
            hour = 0;
        }
        
        return date.atTime(hour, minute);
    }

    /**
     * Helper method to get the next hour time slot
     */
    private String getNextHour(String timeSlot) {
        switch (timeSlot) {
            case "09:00 AM": return "10:00 AM";
            case "10:00 AM": return "11:00 AM";
            case "11:00 AM": return "12:00 PM";
            case "12:00 PM": return "01:00 PM";
            case "01:00 PM": return "02:00 PM";
            case "02:00 PM": return "03:00 PM";
            case "03:00 PM": return "04:00 PM";
            case "04:00 PM": return "05:00 PM";
            case "05:00 PM": return "06:00 PM";
            default: return timeSlot;
        }
    }

    /**
     * Cancel an appointment
     */
    public ScheduleEntity cancelAppointment(Integer scheduleId) {
        ScheduleEntity schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found with ID: " + scheduleId));
        
        // Check if appointment is in the future
        if (schedule.getBookingStartTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot cancel past appointments");
        }

        // Validate appointment status can be changed
        if (schedule.getStatus() == AppointmentStatus.CANCELLED) {
            throw new RuntimeException("Appointment is already cancelled");
        }

        // Set status to CANCELLED instead of deleting
        schedule.setStatus(AppointmentStatus.CANCELLED);
        schedule.setDeclineReason(null); // Clear any decline reason

        return scheduleRepository.save(schedule);
    }

    /**
     * Find a specific schedule by ID
     */
    public Optional<ScheduleEntity> findScheduleById(Integer scheduleId) {
        return scheduleRepository.findById(scheduleId);
    }    /**
     * Get all schedules (admin function)
     */
    public List<ScheduleEntity> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    /**
     * Accept an appointment (for lawyers)
     */
    public ScheduleEntity acceptAppointment(int scheduleId, int lawyerId) {
        ScheduleEntity schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + scheduleId));
        
        // Validate that the lawyer owns this appointment
        if (schedule.getLawyer().getUserId() != lawyerId) {
            throw new RuntimeException("Lawyer does not own this appointment");
        }
        
        // Validate appointment status can be changed
        if (schedule.getStatus() != AppointmentStatus.PENDING) {
            throw new RuntimeException("Only pending appointments can be accepted");
        }
        
        
        schedule.setStatus(AppointmentStatus.ACCEPTED);
        schedule.setDeclineReason(null); // Clear any previous decline reason
        
        reminderService.sendAppointmentReminders(schedule);
        
        return scheduleRepository.save(schedule);
    }

    /**
     * Decline an appointment (for lawyers)
     */
    public ScheduleEntity declineAppointment(int scheduleId, int lawyerId, String reason) {
        ScheduleEntity schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + scheduleId));

        // Validate that the lawyer owns this appointment
        if (schedule.getLawyer().getUserId() != lawyerId) {
            throw new RuntimeException("Lawyer does not own this appointment");
        }

        // Validate appointment status can be changed
        if (schedule.getStatus() != AppointmentStatus.PENDING) {
            throw new RuntimeException("Only pending appointments can be declined");
        }

        schedule.setStatus(AppointmentStatus.DECLINED);
        schedule.setDeclineReason(reason);

        return scheduleRepository.save(schedule);
    }

    /**
     * Get past schedules for a lawyer (appointment history)
     */
    public List<ScheduleEntity> getPastSchedulesForLawyer(LawyerEntity lawyer) {
        return scheduleRepository.findByLawyerAndBookingStartTimeBeforeOrderByBookingStartTimeDesc(lawyer, LocalDateTime.now());
    }

    /**
     * Get past schedules for a client (appointment history)
     */
    public List<ScheduleEntity> getPastSchedulesForClient(ClientEntity client) {
        return scheduleRepository.findByClientAndBookingStartTimeBeforeOrderByBookingStartTimeDesc(client, LocalDateTime.now());
    }
}
