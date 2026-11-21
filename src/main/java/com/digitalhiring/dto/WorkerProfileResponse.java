
package com.digitalhiring.dto;

import com.digitalhiring.entity.Worker;

public class WorkerProfileResponse {

    private Long id;
    private String name;
    private String mobileNumber;
    private String profession;
    private String skills;
    private Integer experience;
    private Double expectedWage;
    private String wageType;
    private String location;
    private String description;
    private String availabilityStatus;
    private String profileImageUrl;

    public WorkerProfileResponse(Worker worker) {

        this.id = worker.getId();
        this.name = worker.getUser().getName();
        this.mobileNumber = worker.getUser().getMobileNumber();
        this.profession = worker.getProfession();
        this.skills = worker.getSkills();
        this.experience = worker.getExperience();
        this.expectedWage = worker.getExpectedWage();
        this.wageType = worker.getWageType();
        this.location = worker.getLocation();
        this.description = worker.getDescription();
        this.availabilityStatus = worker.getAvailabilityStatus();
        this.profileImageUrl = worker.getProfileImageUrl();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public String getProfession() {
        return profession;
    }

    public String getSkills() {
        return skills;
    }

    public Integer getExperience() {
        return experience;
    }

    public Double getExpectedWage() {
        return expectedWage;
    }

    public String getWageType() {
        return wageType;
    }

    public String getLocation() {
        return location;
    }

    public String getDescription() {
        return description;
    }

    public String getAvailabilityStatus() {
        return availabilityStatus;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }
}
