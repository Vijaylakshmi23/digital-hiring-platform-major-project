package com.digitalhiring.dto;

import com.digitalhiring.entity.Role;

public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String mobileNumber;
    private Role role;

    public UserResponse() {
    }

    public UserResponse(Long id, String name, String email,
                        String mobileNumber, Role role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.mobileNumber = mobileNumber;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public Role getRole() {
        return role;
    }
}