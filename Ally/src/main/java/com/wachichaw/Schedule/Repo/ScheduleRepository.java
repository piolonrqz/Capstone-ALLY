package com.wachichaw.Schedule.Repo;

import com.wachichaw.Schedule.Entity.ScheduleEntity;
import com.wachichaw.Lawyer.Entity.LawyerEntity;
import com.wachichaw.Client.Entity.ClientEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

import com.wachichaw.Schedule.Entity.AppointmentStatus;

@Repository
public interface ScheduleRepository extends JpaRepository<ScheduleEntity, Integer> {

    // Find all schedules for a specific lawyer (by entity)
    List<ScheduleEntity> findByLawyer(LawyerEntity lawyer);

    // Find all schedules for a specific client (by entity)
    List<ScheduleEntity> findByClient(ClientEntity client);

    // Find all schedules for a specific lawyer by ID
    List<ScheduleEntity> findByLawyerUserId(Long lawyerId);

    // Find all schedules for a specific client by ID
    List<ScheduleEntity> findByClientUserId(Long clientId);

    // Find upcoming schedules for a lawyer ordered by start time
    List<ScheduleEntity> findByLawyerAndBookingStartTimeAfterOrderByBookingStartTime(LawyerEntity lawyer, LocalDateTime after);

    // Find upcoming schedules for a client ordered by start time
    List<ScheduleEntity> findByClientAndBookingStartTimeAfterOrderByBookingStartTime(ClientEntity client, LocalDateTime after);

    // Find schedules by lawyer within a date range
    List<ScheduleEntity> findByLawyerAndBookingStartTimeBetween(LawyerEntity lawyer, LocalDateTime startTime, LocalDateTime endTime);

    // Check for time conflicts with existing bookings using lawyer entity
    @Query("SELECT s FROM ScheduleEntity s WHERE s.lawyer = :lawyer " +
           "AND ((s.bookingStartTime < :endTime AND s.bookingEndTime > :startTime))")
    List<ScheduleEntity> findConflictingSchedules(
            @Param("lawyer") LawyerEntity lawyer,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    // Find schedules by lawyer within a date range (alternative with query)
    @Query("SELECT s FROM ScheduleEntity s WHERE s.lawyer.userId = :lawyerId " +
           "AND s.bookingStartTime >= :startTime AND s.bookingEndTime <= :endTime")
    List<ScheduleEntity> findByLawyerAndDateRange(
            @Param("lawyerId") Long lawyerId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    // Find upcoming schedules for a lawyer (next 30 days) by lawyer ID
    @Query("SELECT s FROM ScheduleEntity s WHERE s.lawyer.userId = :lawyerId " +
           "AND s.bookingStartTime >= :now AND s.bookingStartTime <= :futureDate " +
           "ORDER BY s.bookingStartTime ASC")
    List<ScheduleEntity> findUpcomingSchedulesForLawyer(
            @Param("lawyerId") Long lawyerId,
            @Param("now") LocalDateTime now,
            @Param("futureDate") LocalDateTime futureDate
    );

    // Find all schedules within a given time range
    List<ScheduleEntity> findByBookingStartTimeBetween(LocalDateTime startTime, LocalDateTime endTime);

    // Find accepted appointments that have ended and need to be marked as completed
    @Query("SELECT s FROM ScheduleEntity s WHERE s.status = :status AND s.bookingEndTime < :now")
    List<ScheduleEntity> findCompletedAppointments(@Param("now") LocalDateTime now, @Param("status") AppointmentStatus status);

    // Find pending appointments that have passed their start time and should be cancelled
    @Query("SELECT s FROM ScheduleEntity s WHERE s.status = :status AND s.bookingStartTime < :now")
    List<ScheduleEntity> findExpiredPendingAppointments(@Param("now") LocalDateTime now, @Param("status") AppointmentStatus status);

    // Find past schedules for a lawyer (booking start time in the past), ordered by most recent first
    List<ScheduleEntity> findByLawyerAndBookingStartTimeBeforeOrderByBookingStartTimeDesc(LawyerEntity lawyer, LocalDateTime before);

    // Find past schedules for a client (booking start time in the past), ordered by most recent first
    List<ScheduleEntity> findByClientAndBookingStartTimeBeforeOrderByBookingStartTimeDesc(ClientEntity client, LocalDateTime before);
}
