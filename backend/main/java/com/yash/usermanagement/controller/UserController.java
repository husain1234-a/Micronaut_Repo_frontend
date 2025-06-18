package com.yash.usermanagement.controller;

import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import io.micronaut.security.annotation.Secured;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.yash.usermanagement.dto.CreateUserRequest;
import com.yash.usermanagement.dto.UpdateUserRequest;
import com.yash.usermanagement.dto.UserResponse;
import com.yash.usermanagement.dto.PasswordChangeRequestDTO;
import com.yash.usermanagement.dto.PasswordChangeApprovalDTO;
import com.yash.usermanagement.model.User;
import com.yash.usermanagement.service.UserService;
import com.yash.usermanagement.service.NotificationService;
import com.yash.usermanagement.exception.ResourceNotFoundException;
import com.yash.usermanagement.exception.ValidationException;
import com.yash.usermanagement.exception.DuplicateResourceException;
import com.yash.usermanagement.model.PasswordChangeRequest;
import com.yash.usermanagement.model.PasswordChangeStatus;
import com.yash.usermanagement.model.UserRole;
import com.yash.usermanagement.repository.PasswordChangeRequestRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Controller("/api/users")
@Tag(name = "User Management")
public class UserController {

    private static final Logger LOG = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;
    private final NotificationService notificationService;
    private final PasswordChangeRequestRepository passwordChangeRequestRepository;

    public UserController(UserService userService, NotificationService notificationService,
            PasswordChangeRequestRepository passwordChangeRequestRepository) {
        this.userService = userService;
        this.notificationService = notificationService;
        this.passwordChangeRequestRepository = passwordChangeRequestRepository;
    }

    @Post
    @Operation(summary = "Create a new user")
    @Secured("ADMIN")
    public HttpResponse<UserResponse> createUser(@Body @Valid CreateUserRequest request) {
        LOG.info("Creating new user with role: {}", request.getRole());
        try {
            User user = convertToUser(request);
            User createdUser = userService.createUser(user);

            // Send welcome notification and email
            notificationService.sendUserCreationNotification(
                    createdUser.getId(),
                    createdUser.getEmail(),
                    request.getPassword());

            return HttpResponse.created(convertToUserResponse(createdUser));
        } catch (DuplicateResourceException e) {
            LOG.warn("Duplicate user creation attempted: {}", e.getMessage());
            throw e;
        } catch (ValidationException e) {
            LOG.warn("Invalid user data: {}", e.getMessage());
            throw e;
        }
    }

    @Get
    @Operation(summary = "Get all users")
    @Secured("ADMIN")
    public HttpResponse<List<UserResponse>> getAllUsers() {
        LOG.info("Fetching all users");
        List<User> users = userService.getAllUsers();
        List<UserResponse> userResponses = users.stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
        return HttpResponse.ok(userResponses);
    }

    @Get("/{id}")
    @Operation(summary = "Get user by ID")
    @Secured({ "ADMIN", "USER" })
    public HttpResponse<UserResponse> getUserById(@PathVariable UUID id) {
        LOG.info("Fetching user with id: {}", id);
        try {
            User user = userService.getUserById(id);
            return HttpResponse.ok(convertToUserResponse(user));
        } catch (ResourceNotFoundException e) {
            LOG.warn("User not found with id: {}", id);
            throw e;
        }
    }

    @Put("/{id}")
    @Operation(summary = "Update user")
    @Secured({ "ADMIN", "USER" })
    public HttpResponse<UserResponse> updateUser(@PathVariable UUID id, @Body @Valid UpdateUserRequest request) {
        LOG.info("Updating user with id: {}", id);
        try {
            User user = convertToUser(request);
            User updatedUser = userService.updateUser(id, user);

            // Send update notification
            try {
                notificationService.sendPasswordChangeNotification(updatedUser.getId(), updatedUser.getEmail());
            } catch (Exception e) {
                LOG.error("Failed to send update notification email: {}", e.getMessage());
            }

            return HttpResponse.ok(convertToUserResponse(updatedUser));
        } catch (ResourceNotFoundException e) {
            LOG.warn("User not found for update with id: {}", id);
            throw e;
        } catch (ValidationException e) {
            LOG.warn("Invalid user data for update: {}", e.getMessage());
            throw e;
        }
    }

    @Delete("/{id}")
    @Operation(summary = "Delete user")
    @Secured({ "ADMIN", "USER" })
    public HttpResponse<Void> deleteUser(@PathVariable UUID id) {
        LOG.info("Deleting user with id: {}", id);
        try {
            User user = userService.getUserById(id); // Get user before deletion
            userService.deleteUser(id);

            // Send deletion notification
            try {
                notificationService.sendPasswordChangeNotification(user.getId(), user.getEmail());
            } catch (Exception e) {
                LOG.error("Failed to send deletion notification email: {}", e.getMessage());
            }

            return HttpResponse.noContent();
        } catch (ResourceNotFoundException e) {
            LOG.warn("User not found for deletion with id: {}", id);
            throw e;
        }
    }

    @Get("/email/{email}")
    @Operation(summary = "Get user by email")
    @Secured({ "ADMIN", "USER" })
    public HttpResponse<UserResponse> getUserByEmail(@PathVariable String email) {
        LOG.info("Finding user by email: {}", email);
        try {
            return userService.findByEmail(email)
                    .map(this::convertToUserResponse)
                    .map(HttpResponse::ok)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        } catch (ValidationException e) {
            LOG.warn("Invalid email format: {}", email);
            throw e;
        }
    }

    @Post("/{id}/change-password")
    @Operation(summary = "Request password change")
    @Secured("USER")
    public HttpResponse<Void> requestPasswordChange(
            @PathVariable UUID id,
            @Body @Valid PasswordChangeRequestDTO request) {
        LOG.info("Requesting password change for user with id: {}", id);
        try {
            User user = userService.getUserById(id);

            // Validate current password
            if (!userService.validateCurrentPassword(id, request.getOldPassword())) {
                throw new ValidationException("Current password is incorrect");
            }

            // Create password change request
            PasswordChangeRequest passwordChangeRequest = new PasswordChangeRequest();
            passwordChangeRequest.setUserId(id);
            passwordChangeRequest.setNewPassword(request.getNewPassword());
            passwordChangeRequest.setStatus(PasswordChangeStatus.PENDING);
            passwordChangeRequest.setCreatedAt(LocalDateTime.now());
            passwordChangeRequestRepository.save(passwordChangeRequest);

            // Send notification to admin
            try {
                notificationService.sendPasswordResetRequestNotification(user.getId(), user.getEmail());
            } catch (Exception e) {
                LOG.error("Failed to send password reset request email: {}", e.getMessage());
            }

            return HttpResponse.accepted();
        } catch (ResourceNotFoundException e) {
            LOG.warn("User not found for password change request with id: {}", id);
            throw e;
        } catch (ValidationException e) {
            LOG.warn("Invalid password change request: {}", e.getMessage());
            throw e;
        }
    }

    @Put("/{id}/approve-password-change")
    @Operation(summary = "Approve password change request")
    @Secured("ADMIN")
    public HttpResponse<Void> approvePasswordChange(
            @PathVariable UUID id,
            @Body @Valid PasswordChangeApprovalDTO request) {
        LOG.info("Processing password change approval for user with id: {}", id);
        try {
            // Verify admin
            User admin = userService.getUserById(request.getAdminId());
            if (admin.getRole() != UserRole.ADMIN) {
                throw new ValidationException("Only admin can approve password changes");
            }

            // Get user and password change request
            User user = userService.getUserById(id);
            PasswordChangeRequest passwordChangeRequest = passwordChangeRequestRepository
                    .findByUserIdAndStatus(id, PasswordChangeStatus.PENDING)
                    .orElseThrow(() -> new ResourceNotFoundException("No pending password change request found"));

            if (request.isApproved()) {
                // Update password
                userService.changePassword(id, passwordChangeRequest.getNewPassword());

                // Update request status and admin ID
                passwordChangeRequest.setStatus(PasswordChangeStatus.APPROVED);
                passwordChangeRequest.setAdminId(request.getAdminId());
                passwordChangeRequest.setUpdatedAt(LocalDateTime.now());
                passwordChangeRequestRepository.update(passwordChangeRequest);

                // Send approval notification
                try {
                    notificationService.sendPasswordResetApprovalNotification(user.getId(), user.getEmail());
                } catch (Exception e) {
                    LOG.error("Failed to send password reset approval email: {}", e.getMessage());
                }
            } else {
                // Reject password change
                userService.rejectPasswordChange(id, request.getAdminId());

                // Update request status and admin ID
                passwordChangeRequest.setStatus(PasswordChangeStatus.REJECTED);
                passwordChangeRequest.setAdminId(request.getAdminId());
                passwordChangeRequest.setUpdatedAt(LocalDateTime.now());
                passwordChangeRequestRepository.update(passwordChangeRequest);

                // Send rejection notification
                try {
                    notificationService.sendPasswordChangeRejectionNotification(user.getId(), user.getEmail());
                } catch (Exception e) {
                    LOG.error("Failed to send password change rejection email: {}", e.getMessage());
                }
            }

            return HttpResponse.ok();
        } catch (ResourceNotFoundException e) {
            LOG.warn("User not found for password change approval with id: {}", id);
            throw e;
        }
    }

    // Helper methods for conversion
    private User convertToUser(CreateUserRequest request) {
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setGender(request.getGender());
        user.setRole(request.getRole());
        user.setAddress(request.getAddress());
        return user;
    }

    private User convertToUser(UpdateUserRequest request) {
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setGender(request.getGender());
        user.setRole(request.getRole());
        user.setAddress(request.getAddress());
        return user;
    }

    private UserResponse convertToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setDateOfBirth(user.getDateOfBirth());
        response.setAddress(user.getAddress());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setGender(user.getGender());
        response.setRole(user.getRole());
        return response;
    }
}