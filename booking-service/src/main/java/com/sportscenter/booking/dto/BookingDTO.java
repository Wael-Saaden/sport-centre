package com.sportscenter.booking.dto;

public class BookingDTO {

    private Long id;
    private Long memberId;
    private Long activityId;
    private String status;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getMemberId() { return memberId; }
    public void setMemberId(Long memberId) { this.memberId = memberId; }

    public Long getActivityId() { return activityId; }
    public void setActivityId(Long activityId) { this.activityId = activityId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
