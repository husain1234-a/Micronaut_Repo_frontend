package com.yash.usermanagement.controller;

import com.yash.usermanagement.model.Notification;
import com.yash.usermanagement.model.NotificationPriority;
import com.yash.usermanagement.service.NotificationService;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import io.micronaut.serde.annotation.Serdeable;

import java.util.List;
import java.util.UUID;

@Controller("/api/notifications")
@Tag(name = "Notification Management")
public class NotificationController {
    private static final Logger LOG = LoggerFactory.getLogger(NotificationController.class);
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Post
    @Operation(summary = "Create a new notification")
    public HttpResponse<Notification> createNotification(@Body @Valid Notification notification) {
        LOG.info("Creating new notification");
        return HttpResponse.created(notificationService.createNotification(notification));
    }

    @Get
    @Operation(summary = "Get all notifications")
    public HttpResponse<List<Notification>> getAllNotifications() {
        LOG.info("Fetching all notifications");
        return HttpResponse.ok(notificationService.getAllNotifications());
    }

    @Get("/{id}")
    @Operation(summary = "Get notification by ID")
    public HttpResponse<Notification> getNotificationById(@PathVariable String id) {
        LOG.info("Fetching notification with id: {}", id);
        return notificationService.getNotificationById(id)
                .map(HttpResponse::ok)
                .orElse(HttpResponse.notFound());
    }

    @Get("/user/{userId}")
    @Operation(summary = "Get notifications by user ID")
    public HttpResponse<List<Notification>> getNotificationsByUserId(@PathVariable UUID userId) {
        LOG.info("Fetching notifications for user: {}", userId);
        return HttpResponse.ok(notificationService.getNotificationsByUserId(userId));
    }

    @Get("/user/{userId}/priority/{priority}")
    @Operation(summary = "Get notifications by user ID and priority")
    public HttpResponse<List<Notification>> getNotificationsByUserIdAndPriority(
            @PathVariable UUID userId,
            @PathVariable NotificationPriority priority) {
        LOG.info("Fetching {} priority notifications for user: {}", priority, userId);
        return HttpResponse.ok(notificationService.getNotificationsByUserIdAndPriority(userId, priority));
    }

    @Delete("/{id}")
    @Operation(summary = "Delete notification")
    public HttpResponse<Void> deleteNotification(@PathVariable String id) {
        LOG.info("Deleting notification with id: {}", id);
        notificationService.deleteNotification(id);
        return HttpResponse.noContent();
    }

    @Post("/broadcast")
    @Operation(summary = "Broadcast notification to all users")
    public HttpResponse<Void> broadcastNotification(
            @Body @Valid Notification notification) {
        LOG.info("Broadcasting notification: {}", notification.getTitle());
        notificationService.broadcastNotification(
                notification.getTitle(),
                notification.getMessage(),
                notification.getPriority());
        return HttpResponse.accepted();
    }

    @Post("/test/welcome")
    @Operation(summary = "Test welcome notification")
    public void testWelcomeNotification(@Body TestNotificationRequest request) {
        notificationService.sendUserCreationNotification(
                request.getUserId(),
                request.getEmail(),
                request.getPassword());
    }

    @Post("/test/reset-request")
    @Operation(summary = "Test password reset request notification")
    public void testResetRequestNotification(@Body TestNotificationRequest request) {
        notificationService.sendPasswordResetRequestNotification(
                request.getUserId(),
                request.getEmail());
    }

    @Post("/test/reset-approval")
    @Operation(summary = "Test password reset approval notification")
    public void testResetApprovalNotification(@Body TestNotificationRequest request) {
        notificationService.sendPasswordResetApprovalNotification(
                request.getUserId(),
                request.getEmail());
    }

    @Post("/test/password-change")
    @Operation(summary = "Test password change notification")
    public void testPasswordChangeNotification(@Body TestNotificationRequest request) {
        notificationService.sendPasswordChangeNotification(
                request.getUserId(),
                request.getEmail());
    }

    @Post("/test/broadcast")
    @Operation(summary = "Test broadcast notification")
    public void testBroadcastNotification(@Body BroadcastNotificationRequest request) {
        notificationService.broadcastNotification(
                request.getTitle(),
                request.getMessage(),
                request.getPriority());
    }
}

@Serdeable
class TestNotificationRequest {
    private UUID userId;
    private String email;
    private String password;

    // Getters and Setters
    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}

@Serdeable
class BroadcastNotificationRequest {
    private String title;
    private String message;
    private NotificationPriority priority;

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public NotificationPriority getPriority() {
        return priority;
    }

    public void setPriority(NotificationPriority priority) {
        this.priority = priority;
    }
}