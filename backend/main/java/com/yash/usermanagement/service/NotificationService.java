package com.yash.usermanagement.service;

import com.yash.usermanagement.model.Notification;
import com.yash.usermanagement.model.NotificationPriority;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationService {
    Notification createNotification(Notification notification);

    List<Notification> getAllNotifications();

    Optional<Notification> getNotificationById(String id);

    List<Notification> getNotificationsByUserId(UUID userId);

    List<Notification> getNotificationsByUserIdAndPriority(UUID userId, NotificationPriority priority);

    void deleteNotification(String id);

    void sendUserCreationNotification(UUID userId, String email, String password);

    void sendPasswordResetRequestNotification(UUID userId, String email);

    void sendPasswordResetApprovalNotification(UUID userId, String email);

    void sendPasswordChangeNotification(UUID userId, String email);

    void sendPasswordChangeRejectionNotification(UUID userId, String email);

    void broadcastNotification(String title, String message, NotificationPriority priority);

    void sendAccountDeletionNotification(UUID userId, String email);
}