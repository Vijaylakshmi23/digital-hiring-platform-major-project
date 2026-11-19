
package com.digitalhiring.dto;

import com.digitalhiring.entity.BookingStatus;

public class BookingStatusRequest {

    private BookingStatus status;

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }
}
