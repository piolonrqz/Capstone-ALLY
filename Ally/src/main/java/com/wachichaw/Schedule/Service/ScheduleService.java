package com.wachichaw.Schedule.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wachichaw.Schedule.Entity.ScheduleEntity;
import com.wachichaw.Schedule.Repo.ScheduleRepository;
import com.wachichaw.Lawyer.Entity.LawyerEntity;
import com.wachichaw.Lawyer.Repo.LawyerRepo;
import com.wachichaw.Client.Entity.ClientEntity;
import com.wachichaw.Client.Repo.ClientRepo;

@Service
public class ScheduleService {

    @Autowired
    private final ScheduleRepository scheduleRepository;
    @Autowired
    private ClientRepo clientRepo;
    @Autowired
    private LawyerRepo lawyerRepo;

    public ScheduleService(ScheduleRepository scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }

    /**
     * Create a new appointment booking
     */
    public ScheduleEntity createAppointment(int clientId, int lawyerId, LocalDateTime startTime, LocalDateTime endTime) {
        // Validate client exists
        ClientEntity client = clientRepo.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with ID: " + clientId));
        
        // Validate lawyer exists
        LawyerEntity lawyer = lawyerRepo.findById(lawyerId)
                .orElseThrow(() -> new RuntimeException("Lawyer not found with ID: " + lawyerId));

        // Check for scheduling conflicts
        if (hasSchedulingConflict(lawyer, startTime, endTime)) {
            throw new RuntimeException("Lawyer is not available at the requested time slot");
        }

        // Validate booking time (must be in the future)
        if (startTime.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot book appointments in the past");
        }

        // Validate end time is after start time
        if (endTime.isBefore(startTime) || endTime.equals(startTime)) {
            throw new RuntimeException("End time must be after start time");
        }

        // Create and save the schedule
        ScheduleEntity schedule = new ScheduleEntity();
        schedule.setClient(client);
        schedule.setLawyer(lawyer);
        schedule.setBookingStartTime(startTime);
        schedule.setBookingEndTime(endTime);

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
     * Get available time slots for a lawyer on a specific date
     * This is a simple implementation - can be enhanced with business hours, break times, etc.
     */
    public List<LocalDateTime> getAvailableTimeSlots(LawyerEntity lawyer, LocalDateTime date, int durationMinutes) {
        // This would typically be more complex, considering business hours, lunch breaks, etc.
        // For now, returning empty list - can be implemented based on business requirements
        return List.of();
    }    /**
     * Cancel an appointment
     */
    public void cancelAppointment(Integer scheduleId) {
        ScheduleEntity schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found with ID: " + scheduleId));
        
        // Check if appointment is in the future
        if (schedule.getBookingStartTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot cancel past appointments");
        }

        scheduleRepository.delete(schedule);
    }

    /**
     * Reschedule an appointment
     */
    public ScheduleEntity rescheduleAppointment(Integer scheduleId, LocalDateTime newStartTime, LocalDateTime newEndTime) {
        ScheduleEntity schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found with ID: " + scheduleId));

        // Check if original appointment is in the future
        if (schedule.getBookingStartTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot reschedule past appointments");
        }

        // Validate new time slot
        if (newStartTime.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot reschedule to a past time");
        }

        if (newEndTime.isBefore(newStartTime) || newEndTime.equals(newStartTime)) {
            throw new RuntimeException("End time must be after start time");
        }        // Check for conflicts (excluding the current appointment)
        List<ScheduleEntity> conflicts = scheduleRepository.findConflictingSchedules(schedule.getLawyer(), newStartTime, newEndTime);
        conflicts.removeIf(s -> s.getScheduleId() == scheduleId); // Fixed comparison for int
        
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Lawyer is not available at the requested new time slot");
        }

        // Update the schedule
        schedule.setBookingStartTime(newStartTime);
        schedule.setBookingEndTime(newEndTime);

        return scheduleRepository.save(schedule);
    }

    /**
     * Find a specific schedule by ID
     */
    public Optional<ScheduleEntity> findScheduleById(Integer scheduleId) {
        return scheduleRepository.findById(scheduleId);
    }

    /**
     * Get all schedules (admin function)
     */
    public List<ScheduleEntity> getAllSchedules() {
        return scheduleRepository.findAll();
    }
}
