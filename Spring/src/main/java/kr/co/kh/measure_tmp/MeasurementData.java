package kr.co.kh.measure_tmp;

import javax.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class MeasurementData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long measurementId;

    private String memberId;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
