package com.wachichaw.Schedule.Service;

import com.wachichaw.Schedule.Entity.ScheduleEntity;
import com.wachichaw.Schedule.Entity.AppointmentStatus;
import com.wachichaw.Schedule.Repo.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class ReminderTask {

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private ReminderService reminderService;

    @Scheduled(cron = "0 0 9 * * *") // Run every day at 9 AM
    public void sendAppointmentReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tomorrow = now.plusDays(1);

        List<ScheduleEntity> upcomingAppointments = scheduleRepository.findByBookingStartTimeBetween(now, tomorrow);

        for (ScheduleEntity schedule : upcomingAppointments) {
            reminderService.sendAppointmentReminders(schedule);
        }
    }

    @Scheduled(cron = "0 0/15 * * * *") // Run every 15 minutes
    public void updateAppointmentStatuses() {
        LocalDateTime now = LocalDateTime.now();

        // Find accepted appointments that have ended and mark them as completed
        List<ScheduleEntity> completedAppointments = scheduleRepository.findCompletedAppointments(now, AppointmentStatus.ACCEPTED);
        for (ScheduleEntity schedule : completedAppointments) {
            schedule.setStatus(AppointmentStatus.COMPLETED);
            scheduleRepository.save(schedule);
        }

        // Find pending appointments that have passed their start time and cancel them
        List<ScheduleEntity> expiredPendingAppointments = scheduleRepository.findExpiredPendingAppointments(now, AppointmentStatus.PENDING);
        for (ScheduleEntity schedule : expiredPendingAppointments) {
            schedule.setStatus(AppointmentStatus.CANCELLED);
            scheduleRepository.save(schedule);
        }
    }
}
