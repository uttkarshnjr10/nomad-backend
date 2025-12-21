package com.nomad.auth.mapper;

import com.nomad.auth.domain.User;
import com.nomad.auth.dto.AuthResponse;
import com.nomad.auth.dto.RegisterRequest;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(RegisterRequest request) {
        if (request == null) {
            return null;
        }

        return User.builder()
                .username(request.username())
                .email(request.email())
                .build();
    }

    public AuthResponse toResponse(User user, String token) {
        if (user == null) {
            return null;
        }

        return new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );
    }
}