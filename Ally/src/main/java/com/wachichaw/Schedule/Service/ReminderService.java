package com.wachichaw.Schedule.Service;

import com.wachichaw.EmailConfig.EmailService;
import com.wachichaw.Schedule.Entity.ScheduleEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class ReminderService {

    @Autowired
    private EmailService emailService;

    public void sendAppointmentReminders(ScheduleEntity schedule) {
        // Send reminder to client
        emailService.sendAppointmentReminder(
                schedule.getClient().getEmail(),
                schedule.getClient().getFname(),
                schedule.getBookingStartTime(),
                "client"
        );

        // Send reminder to lawyer
        emailService.sendAppointmentReminder(
                schedule.getLawyer().getEmail(),
                schedule.getLawyer().getFname(),
                schedule.getBookingStartTime(),
                "lawyer"
        );
    }
}