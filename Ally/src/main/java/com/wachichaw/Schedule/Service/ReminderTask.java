package com.wachichaw.Schedule.Service;

import com.wachichaw.Schedule.Entity.ScheduleEntity;
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
}