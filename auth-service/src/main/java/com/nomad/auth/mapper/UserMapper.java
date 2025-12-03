package com.nomad.auth.mapper;

import com.nomad.auth.domain.User;
import com.nomad.auth.dto.AuthResponse;
import com.nomad.auth.dto.RegisterRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    @Mapping(target = "password", ignore = true)
    User toEntity(RegisterRequest request);

    // Explicitly map the User's 'id' to the Response's 'userId'
    @Mapping(source = "user.id", target = "userId")
    AuthResponse toResponse(User user, String token);
}