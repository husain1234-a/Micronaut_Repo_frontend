package com.yash.usermanagement.service.impl;

import com.yash.usermanagement.model.PasswordChangeRequest;
import com.yash.usermanagement.model.PasswordChangeStatus;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.yash.usermanagement.exception.DatabaseException;
import com.yash.usermanagement.exception.ResourceNotFoundException;
import com.yash.usermanagement.exception.ValidationException;
import com.yash.usermanagement.model.Address;
import com.yash.usermanagement.model.User;
import com.yash.usermanagement.model.UserRole;
import com.yash.usermanagement.repository.AddressRepository;
import com.yash.usermanagement.repository.UserRepository;
import com.yash.usermanagement.repository.PasswordChangeRequestRepository;
import com.yash.usermanagement.service.UserService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Singleton
public class UserServiceImpl implements UserService {

    private static final Logger LOG = LoggerFactory.getLogger(UserServiceImpl.class);
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final PasswordChangeRequestRepository passwordChangeRequestRepository;

    public UserServiceImpl(UserRepository userRepository, AddressRepository addressRepository,
            PasswordChangeRequestRepository passwordChangeRequestRepository) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.passwordChangeRequestRepository = passwordChangeRequestRepository;
    }

    @Override
    @Transactional
    public User createUser(User user) {
        try {
            LOG.info("Creating new user with email: {}", user.getEmail());

            // Check if user with email already exists
            Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
            if (existingUser.isPresent()) {
                throw new DatabaseException("User with email " + user.getEmail() + " already exists");
            }

            // First create address if present
            if (user.getAddress() != null) {
                Address address = user.getAddress();
                Address savedAddress = addressRepository.save(address);
                user.setAddress(savedAddress);
            }

            User savedUser = userRepository.save(user);
            LOG.info("User created successfully with ID: {}", savedUser.getId());
            return savedUser;
        } catch (Exception e) {
            LOG.error("Error creating user: {}", e.getMessage());
            throw new DatabaseException("Failed to create user", e);
        }
    }

    @Override
    public List<User> getAllUsers() {
        try {
            LOG.info("Fetching all users");
            return userRepository.findAll();
        } catch (Exception e) {
            LOG.error("Error fetching users: {}", e.getMessage());
            throw new DatabaseException("Failed to fetch users", e);
        }
    }

    @Override
    public User getUserById(UUID id) {
        try {
            LOG.info("Fetching user with id: {}", id);
            return userRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Error fetching user: {}", e.getMessage());
            throw new DatabaseException("Failed to fetch user", e);
        }
    }

    @Override
    @Transactional
    public User updateUser(UUID id, User userDetails) {
        try {
            LOG.info("Updating user with id: {}", id);
            User existingUser = getUserById(id);

            // Update address if present
            if (userDetails.getAddress() != null) {
                Address address = userDetails.getAddress();
                if (existingUser.getAddress() != null && existingUser.getAddress().getId() != null) {
                    // Update existing address
                    address.setId(existingUser.getAddress().getId());
                    Address updatedAddress = addressRepository.update(address);
                    existingUser.setAddress(updatedAddress);
                } else {
                    // Create new address
                    Address savedAddress = addressRepository.save(address);
                    existingUser.setAddress(savedAddress);
                }
            }

            // Update other user fields
            existingUser.setFirstName(userDetails.getFirstName());
            existingUser.setLastName(userDetails.getLastName());
            existingUser.setEmail(userDetails.getEmail());
            existingUser.setGender(userDetails.getGender());
            existingUser.setDateOfBirth(userDetails.getDateOfBirth());
            existingUser.setPhoneNumber(userDetails.getPhoneNumber());
            existingUser.setRole(userDetails.getRole());

            User updatedUser = userRepository.update(existingUser);
            LOG.info("User updated successfully with ID: {}", id);
            return updatedUser;
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Error updating user: {}", e.getMessage());
            throw new DatabaseException("Failed to update user", e);
        }
    }

    @Override
    @Transactional
    public void deleteUser(UUID id) {
        try {
            LOG.info("Deleting user with id: {}", id);
            User user = getUserById(id);

            // Delete address if exists
            if (user.getAddress() != null && user.getAddress().getId() != null) {
                addressRepository.deleteById(user.getAddress().getId());
            }

            userRepository.deleteById(id);
            LOG.info("User deleted successfully with ID: {}", id);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Error deleting user: {}", e.getMessage());
            throw new DatabaseException("Failed to delete user", e);
        }
    }

    @Override
    public Optional<User> findByEmail(String email) {
        try {
            LOG.info("Finding user by email: {}", email);
            return userRepository.findByEmail(email);
        } catch (Exception e) {
            LOG.error("Error finding user by email: {}", e.getMessage());
            throw new DatabaseException("Failed to find user by email", e);
        }
    }

    @Override
    public Optional<User> getUserByEmail(String email) {
        try {
            LOG.info("Fetching user with email: {}", email);
            Optional<User> user = userRepository.findByEmail(email);
            if (user.isPresent()) {
                LOG.info("User found with email: {}", email);
            } else {
                LOG.warn("User not found with email: {}", email);
            }
            return user;
        } catch (Exception e) {
            LOG.error("Error fetching user with email {}: {}", email, e.getMessage(), e);
            throw new DatabaseException("Failed to fetch user by email", e);
        }
    }

    @Override
    public boolean existsByEmail(String email) {
        try {
            LOG.info("Checking if user exists with email: {}", email);
            boolean exists = userRepository.existsByEmail(email);
            LOG.info("User exists with email {}: {}", email, exists);
            return exists;
        } catch (Exception e) {
            LOG.error("Error checking user existence with email {}: {}", email, e.getMessage(), e);
            throw new DatabaseException("Failed to check user existence", e);
        }
    }

    @Override
    @Transactional
    public void changePassword(UUID userId, String newPassword) {
        try {
            LOG.info("Changing password for user with ID: {}", userId);
            userRepository.findById(userId)
                    .ifPresentOrElse(
                            user -> {
                                user.setPassword(newPassword);
                                userRepository.update(user);
                                LOG.info("Password changed successfully for user with ID: {}", userId);
                            },
                            () -> {
                                LOG.warn("User not found with ID: {}", userId);
                                throw new ResourceNotFoundException("User not found with ID: " + userId);
                            });
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Error changing password for user with ID {}: {}", userId, e.getMessage(), e);
            throw new DatabaseException("Failed to change password", e);
        }
    }

    @Override
    @Transactional
    public void requestPasswordChange(UUID userId) {
        try {
            LOG.info("Requesting password change for user with ID: {}", userId);
            if (!userRepository.existsById(userId)) {
                LOG.warn("User not found with ID: {}", userId);
                throw new ResourceNotFoundException("User not found with ID: " + userId);
            }
            // Implementation for password change request
            LOG.info("Password change requested successfully for user with ID: {}", userId);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Error requesting password change for user with ID {}: {}", userId, e.getMessage(), e);
            throw new DatabaseException("Failed to request password change", e);
        }
    }

    @Override
    @Transactional
    public void approvePasswordChange(UUID userId) {
        try {
            LOG.info("Approving password change for user with ID: {}", userId);
            if (!userRepository.existsById(userId)) {
                LOG.warn("User not found with ID: {}", userId);
                throw new ResourceNotFoundException("User not found with ID: " + userId);
            }
            // Implementation for approving password change
            LOG.info("Password change approved successfully for user with ID: {}", userId);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Error approving password change for user with ID {}: {}", userId, e.getMessage(), e);
            throw new DatabaseException("Failed to approve password change", e);
        }
    }

    @Override
    public void rejectPasswordChange(UUID userId, UUID adminId) {
        LOG.info("Rejecting password change request for user: {}", userId);
        try {
            User user = getUserById(userId);
            User admin = getUserById(adminId);

            if (admin.getRole() != UserRole.ADMIN) {
                throw new ValidationException("Only admin can reject password changes");
            }

            PasswordChangeRequest request = passwordChangeRequestRepository
                    .findByUserIdAndStatus(userId, PasswordChangeStatus.PENDING)
                    .orElseThrow(() -> new ResourceNotFoundException("No pending password change request found"));

            request.setStatus(PasswordChangeStatus.REJECTED);
            request.setAdminId(adminId);
            request.setUpdatedAt(LocalDateTime.now());
            passwordChangeRequestRepository.update(request);

            LOG.info("Password change request rejected for user: {}", userId);
        } catch (Exception e) {
            LOG.error("Error rejecting password change request: {}", e.getMessage());
            throw new DatabaseException("Failed to reject password change request", e);
        }
    }

    @Override
    public List<PasswordChangeRequest> getPendingPasswordChangeRequests() {
        LOG.info("Fetching all pending password change requests");
        try {
            return passwordChangeRequestRepository.findByStatus(PasswordChangeStatus.PENDING);
        } catch (Exception e) {
            LOG.error("Error fetching pending password change requests: {}", e.getMessage());
            throw new DatabaseException("Failed to fetch pending password change requests", e);
        }
    }

    @Override
    public Optional<PasswordChangeRequest> getPasswordChangeRequestByUserId(UUID userId) {
        LOG.info("Fetching password change request for user: {}", userId);
        try {
            return passwordChangeRequestRepository.findByUserIdAndStatus(userId, PasswordChangeStatus.PENDING);
        } catch (Exception e) {
            LOG.error("Error fetching password change request: {}", e.getMessage());
            throw new DatabaseException("Failed to fetch password change request", e);
        }
    }

    @Override
    public boolean validateCurrentPassword(UUID userId, String currentPassword) {
        LOG.info("Validating current password for user with ID: {}", userId);
        try {
            User user = getUserById(userId);
            // Here you should use your password hashing mechanism to compare passwords
            // For example, if using BCrypt:
            // return BCrypt.checkpw(currentPassword, user.getPassword());
            return currentPassword.equals(user.getPassword()); // This is just for example, use proper password hashing
                                                               // in production
        } catch (Exception e) {
            LOG.error("Error validating current password for user with ID {}: {}", userId, e.getMessage(), e);
            throw new DatabaseException("Failed to validate current password", e);
        }
    }
}