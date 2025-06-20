package com.yash.usermanagement.service.impl;

import com.yash.usermanagement.exception.ResourceNotFoundException;
import com.yash.usermanagement.model.Notification;
import com.yash.usermanagement.model.NotificationPriority;
import com.yash.usermanagement.model.User;
import com.yash.usermanagement.repository.NotificationRepository;
import com.yash.usermanagement.repository.UserRepository;
import com.yash.usermanagement.service.NotificationService;
import jakarta.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import com.yash.usermanagement.config.SendGridConfig;
import com.yash.usermanagement.service.impl.SendGridEmailService;

@Singleton
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);
    private static final String ADMIN_EMAIL = "en20cs301184@medicaps.ac.in";
    private static final String RESET_PASSWORD_URL = "http://localhost/reset-password";

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SendGridEmailService sendGridEmailService;
    private final SendGridConfig sendGridConfig;

    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            SendGridEmailService sendGridEmailService,
            SendGridConfig sendGridConfig) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.sendGridEmailService = sendGridEmailService;
        this.sendGridConfig = sendGridConfig;
    }

    @Override
    public Notification createNotification(Notification notification) {
        // Validate user exists
        User user = userRepository.findById(notification.getUserId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("User not found with id: " + notification.getUserId()));
        notification.setId(UUID.randomUUID().toString());
        notification.setRead(false);
        notification.setCreatedAt(java.time.LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    @Override
    public List<Notification> getAllNotifications() {
        log.info("Fetching all notifications");
        return notificationRepository.findAll();
    }

    @Override
    public Optional<Notification> getNotificationById(String id) {
        log.info("Fetching notification with id: {}", id);
        return notificationRepository.findById(id);
    }

    @Override
    public List<Notification> getNotificationsByUserId(UUID userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        log.info("Fetching notifications for user: {}", userId);
        return notificationRepository.findByUserId(userId);
    }

    @Override
    public List<Notification> getNotificationsByUserIdAndPriority(UUID userId, NotificationPriority priority) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        log.info("Fetching {} priority notifications for user: {}", priority, userId);
        return notificationRepository.findByUserIdAndPriority(userId, priority);
    }

    @Override
    public void deleteNotification(String id) {
        log.info("Deleting notification with id: {}", id);
        notificationRepository.findById(id).ifPresent(notificationRepository::delete);
    }

    @Override
    public void sendUserCreationNotification(UUID userId, String email, String password) {
        log.info("Sending user creation notification to: {}", email);
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

            Notification notification = new Notification();
            notification.setUserId(userId);
            notification.setTitle("Welcome to User Management System");
            notification.setMessage("Your account has been created successfully.");
            notification.setPriority(NotificationPriority.HIGH);
            notification.setRead(false);
            notification.setCreatedAt(java.time.LocalDateTime.now());
            notificationRepository.save(notification);

            String plainTextBody = "Welcome to User Management System!\n\n" +
                    "Your account has been created successfully.\n" +
                    "Your temporary password is: " + password + "\n\n" +
                    "Please change your password after first login.";

            String htmlBody = "<h2>Welcome to User Management System</h2><br>" +
                    "<p>Your account has been created successfully.</p>" +
                    "<p>Your temporary password is: <strong>" + password + "</strong></p>" +
                    "<p>Please change your password after first login.</p>";

            boolean emailSent = sendGridEmailService.sendEmail(
                    user.getEmail(),
                    "Welcome to User Management System",
                    plainTextBody,
                    htmlBody);

            if (!emailSent) {
                log.warn("Failed to send welcome email to user: {}", user.getEmail());
            }

        } catch (Exception e) {
            log.error("Error in sendUserCreationNotification for user: {}", userId, e);
            throw e;
        }
    }

    @Override
    public void sendPasswordResetRequestNotification(UUID userId, String email) {
        log.info("Sending password reset request notification for user: {}", userId);
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

            Notification notification = new Notification();
            notification.setUserId(userId);
            notification.setTitle("Password Reset Request");
            notification.setMessage("A password reset has been requested for your account.");
            notification.setPriority(NotificationPriority.HIGH);
            notification.setRead(false);
            notification.setCreatedAt(java.time.LocalDateTime.now());
            notificationRepository.save(notification);

            // Send email to user
            String subject = "Password Reset Request";
            String textContent = "A password reset has been requested for your account.\n" +
                    "Please wait for admin approval.";
            String htmlContent = "<h3>Password Reset Request</h3><br>" +
                    "<p>A password reset has been requested for your account.</p><br>" +
                    "<p>Please wait for admin approval.</p>";

            sendGridEmailService.sendEmail(
                    user.getEmail(),
                    subject,
                    textContent,
                    htmlContent);

            // Send email to admin
            String adminSubject = "New Password Change Request";
            String adminTextContent = "A new password change request has been submitted by user:\n" +
                    "User ID: " + userId + "\n" +
                    "User Name: " + user.getFirstName() + " " + user.getLastName() + "\n" +
                    "User Email: " + user.getEmail() + "\n\n" +
                    "Please review and take appropriate action.";
            String adminHtmlContent = "<h3>New Password Change Request</h3><br>" +
                    "<p>A new password change request has been submitted by user:</p>" +
                    "<p><strong>User ID:</strong> " + userId + "</p>" +
                    "<p><strong>User Name:</strong> " + user.getFirstName() + " " + user.getLastName() + "</p>" +
                    "<p><strong>User Email:</strong> " + user.getEmail() + "</p><br>" +
                    "<p>Please review and take appropriate action.</p>";

            sendGridEmailService.sendEmail(
                    ADMIN_EMAIL,
                    adminSubject,
                    adminTextContent,
                    adminHtmlContent);

            log.info("Password reset request emails sent successfully to user: {} and admin", user.getEmail());
        } catch (Exception e) {
            log.error("Error in sendPasswordResetRequestNotification for user: {}", userId, e);
            throw new RuntimeException("Failed to send password reset request notification", e);
        }
    }

    @Override
    public void sendPasswordResetApprovalNotification(UUID userId, String email) {
        log.info("Sending password reset approval notification for user: {}", userId);
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

            Notification notification = new Notification();
            notification.setUserId(userId);
            notification.setTitle("Password Reset Approved");
            notification.setMessage("Your password reset request has been approved.");
            notification.setPriority(NotificationPriority.HIGH);
            notification.setRead(false);
            notification.setCreatedAt(java.time.LocalDateTime.now());
            notificationRepository.save(notification);

            // Send email using SendGrid
            String subject = "Password Reset Approved";
            String textContent = "Your password reset request has been approved.\n" +
                    "Please use the link below to reset your password.";
            String htmlContent = "<h3>Password Reset Approved</h3><br>" +
                    "<p>Your password reset request has been approved.</p><br>" +
                    "<p>Please use the link below to reset your password.</p>";

            sendGridEmailService.sendEmail(
                    user.getEmail(),
                    subject,
                    textContent,
                    htmlContent);

            log.info("Password reset approval email sent successfully to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Error in sendPasswordResetApprovalNotification for user: {}", userId, e);
            throw new RuntimeException("Failed to send password reset approval notification", e);
        }
    }

    @Override
    public void sendPasswordChangeNotification(UUID userId, String email) {
        log.info("Sending password change notification for user: {}", userId);
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

            Notification notification = new Notification();
            notification.setUserId(userId);
            notification.setTitle("Password Changed");
            notification.setMessage("Your password has been changed successfully.");
            notification.setPriority(NotificationPriority.HIGH);
            notification.setRead(false);
            notification.setCreatedAt(java.time.LocalDateTime.now());
            notificationRepository.save(notification);

            String plainTextBody = "Your password has been changed successfully.\n" +
                    "If you did not make this change, please contact support immediately.";
            String htmlBody = "Your password has been changed successfully.<br>" +
                    "If you did not make this change, please contact support immediately.";

            boolean emailSent = sendGridEmailService.sendEmail(
                    user.getEmail(),
                    "Password Changed",
                    plainTextBody,
                    htmlBody);

            if (!emailSent) {
                log.warn("Failed to send password change email to user: {}", user.getEmail());
            }

        } catch (Exception e) {
            log.error("Error in sendPasswordChangeNotification for user: {}", userId, e);
            throw e;
        }
    }

    @Override
    public void broadcastNotification(String title, String message, NotificationPriority priority) {
        log.info("Broadcasting notification: {}", title);
        try {
            List<User> users = userRepository.findAll();

            for (User user : users) {
                Notification notification = new Notification();
                notification.setUserId(user.getId());
                notification.setTitle(title);
                notification.setMessage(message);
                notification.setPriority(priority);
                notification.setRead(false);
                notification.setCreatedAt(java.time.LocalDateTime.now());
                notificationRepository.save(notification);

                boolean emailSent = sendGridEmailService.sendEmail(
                        user.getEmail(),
                        title,
                        message,
                        "<h2>" + title + "</h2><br><p>" + message + "</p>");

                if (!emailSent) {
                    log.warn("Failed to send broadcast email to user: {}", user.getEmail());
                }
            }
        } catch (Exception e) {
            log.error("Error in broadcastNotification", e);
            throw new RuntimeException("Failed to broadcast notification", e);
        }
    }

    @Override
    public void sendPasswordChangeRejectionNotification(UUID userId, String email) {
        log.info("Sending password change rejection notification for user: {}", userId);
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

            Notification notification = new Notification();
            notification.setUserId(userId);
            notification.setTitle("Password Change Request Rejected");
            notification.setMessage("Your password change request has been rejected by the administrator.");
            notification.setPriority(NotificationPriority.HIGH);
            notification.setRead(false);
            notification.setCreatedAt(java.time.LocalDateTime.now());
            notificationRepository.save(notification);

            // Send email using SendGrid
            String subject = "Password Change Request Rejected";
            String textContent = "Your password change request has been rejected by the administrator.\n" +
                    "If you believe this is an error, please contact support.";
            String htmlContent = "<h3>Password Change Request Rejected</h3><br>" +
                    "<p>Your password change request has been rejected by the administrator.</p><br>" +
                    "<p>If you believe this is an error, please contact support.</p>";

            sendGridEmailService.sendEmail(
                    user.getEmail(),
                    subject,
                    textContent,
                    htmlContent);

            log.info("Password change rejection email sent successfully to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Error in sendPasswordChangeRejectionNotification for user: {}", userId, e);
            throw new RuntimeException("Failed to send password change rejection notification", e);
        }
    }

    @Override
    public void sendAccountDeletionNotification(UUID userId, String email) {
        log.info("Sending account deletion notification for user: {}", userId);
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

            Notification notification = new Notification();
            notification.setUserId(userId);
            notification.setTitle("Account Scheduled for Deletion");
            notification.setMessage("Your account has been scheduled for deletion. If this was not you, please contact support immediately.");
            notification.setPriority(NotificationPriority.HIGH);
            notification.setRead(false);
            notification.setCreatedAt(java.time.LocalDateTime.now());
            notificationRepository.save(notification);

            String subject = "Account Scheduled for Deletion";
            String textContent = "Your account has been scheduled for deletion. If this was not you, please contact support immediately.";
            String htmlContent = "<h3>Account Scheduled for Deletion</h3><br>" +
                    "<p>Your account has been scheduled for deletion. If this was not you, please contact support immediately.</p>";

            sendGridEmailService.sendEmail(
                    user.getEmail(),
                    subject,
                    textContent,
                    htmlContent);

            log.info("Account deletion email sent successfully to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Error in sendAccountDeletionNotification for user: {}", userId, e);
            throw new RuntimeException("Failed to send account deletion notification", e);
        }
    }
}